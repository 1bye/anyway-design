#import <AppKit/AppKit.h>
#import <dlfcn.h>

// Extraction-only declarations, verified against IconServices on macOS 26.6.
// The shipped React component uses PNGs and never calls these private APIs.
@interface NSObject (NativeSettingsIconRendering)
- (instancetype)initWithConfigurationDictionary:(NSDictionary *)dictionary;
- (instancetype)initWithSymbolName:(NSString *)name
                     configuration:(id)configuration;
- (instancetype)initWithSize:(CGSize)size scale:(double)scale;
- (CGImageRef)CGImageForDescriptor:(id)descriptor;
@end

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 2 || !dlopen("/System/Library/PrivateFrameworks/"
                             "IconServices.framework/IconServices",
                             RTLD_NOW)) {
      fprintf(stderr,
              "Expected a native icon job manifest and macOS IconServices.\n");
      return 1;
    }
    NSError *error = nil;
    NSData *data = [NSData dataWithContentsOfFile:@(argv[1])];
    NSArray *jobs = data ? [NSJSONSerialization JSONObjectWithData:data
                                                           options:0
                                                             error:&error]
                         : nil;
    Class parserClass = NSClassFromString(@"ISGraphicIconConfigurationParser");
    Class configClass = NSClassFromString(@"ISGraphicIconConfiguration");
    Class iconClass = NSClassFromString(@"ISSymbolIcon");
    Class descriptorClass = NSClassFromString(@"ISImageDescriptor");
    if (!jobs || !parserClass || !configClass || !iconClass ||
        !descriptorClass) {
      fprintf(stderr, "Native icon renderer unavailable: %s\n",
              error.description.UTF8String);
      return 1;
    }
    for (NSDictionary *job in jobs) {
      id parser = [[parserClass alloc]
          initWithConfigurationDictionary:job[@"configuration"]];
      NSString *symbol = [parser valueForKey:@"symbolName"];
      if (!symbol || [symbol isEqualToString:@"questionmark.app.dashed"]) {
        fprintf(stderr, "Unresolved native icon configuration: %s\n",
                [job[@"name"] UTF8String]);
        return 1;
      }
      id config = [[configClass alloc] init];
      for (NSString *key in
           @[ @"enclosureColors", @"symbolColors", @"renderingMode" ]) {
        [config setValue:[parser valueForKey:key] forKey:key];
      }
      id icon = [[iconClass alloc] initWithSymbolName:symbol
                                        configuration:config];
      for (NSNumber *size in @[ @24, @64 ]) {
        NSInteger points = size.integerValue;
        NSInteger pixels = points * 2;
        id descriptor =
            [[descriptorClass alloc] initWithSize:CGSizeMake(points, points)
                                            scale:2];
        // Variant 0 is the native default-color rendition; 3 follows the clear
        // icon theme.
        [descriptor setValue:@0 forKey:@"appearanceVariant"];
        [descriptor setValue:@0 forKey:@"appearance"];
        CGImageRef cg = [icon CGImageForDescriptor:descriptor];
        if (!cg) {
          fprintf(stderr, "Unable to render native icon: %s\n",
                  [job[@"name"] UTF8String]);
          return 1;
        }
        NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc]
            initWithBitmapDataPlanes:NULL
                          pixelsWide:pixels
                          pixelsHigh:pixels
                       bitsPerSample:8
                     samplesPerPixel:4
                            hasAlpha:YES
                            isPlanar:NO
                      colorSpaceName:NSDeviceRGBColorSpace
                         bytesPerRow:0
                        bitsPerPixel:0];
        bitmap.size = NSMakeSize(points, points);
        [NSGraphicsContext saveGraphicsState];
        [NSGraphicsContext
            setCurrentContext:[NSGraphicsContext
                                  graphicsContextWithBitmapImageRep:bitmap]];
        [[[NSImage alloc] initWithCGImage:cg size:NSMakeSize(points, points)]
            drawInRect:NSMakeRect(0, 0, points, points)];
        [NSGraphicsContext restoreGraphicsState];
        NSInteger visible = 0;
        for (NSInteger y = 0; y < pixels; y++) {
          for (NSInteger x = 0; x < pixels; x++) {
            if (bitmap.bitmapData[y * bitmap.bytesPerRow + x * 4 + 3] > 0)
              visible++;
          }
        }
        NSString *suffix = points == 64 ? @"-large" : @"";
        NSString *file =
            [NSString stringWithFormat:@"%@/%@%@.png", job[@"output"],
                                       job[@"name"], suffix];
        NSData *png = [bitmap representationUsingType:NSBitmapImageFileTypePNG
                                           properties:@{}];
        if (visible < pixels * pixels / 4 || ![png
                                                 writeToFile:file
                                                     options:NSDataWritingAtomic
                                                       error:&error]) {
          fprintf(stderr, "Invalid native export %s: %s\n", file.UTF8String,
                  error.description.UTF8String);
          return 1;
        }
      }
    }
    printf("Rendered %lu native color icon configurations.\n",
           (unsigned long)jobs.count);
  }
  return 0;
}
