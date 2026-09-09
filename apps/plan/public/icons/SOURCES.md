# Icon library credits

The searchable catalog is derived from [theSVG](https://github.com/glincker/thesvg) at revision `19107207407cd85eaebd5a84b2ba7084336c69fc`. Its 6,541 entries include brand logos, AWS architecture icons, Google Cloud icons, Azure services, and community collections.

SVG artwork is loaded unchanged from this pinned revision through jsDelivr. The original per-icon licenses, source URLs, aliases, and categories are recorded in the [source manifest](https://github.com/glincker/thesvg/blob/19107207407cd85eaebd5a84b2ba7084336c69fc/src/data/icons.json). The catalog's label, color, and variant are stored with each node so saved plans do not depend on a live catalog lookup.

- AWS artwork: Amazon Web Services, [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/), distributed by theSVG under CC BY-ND 2.0.
- Google Cloud artwork: Google, [Google Cloud Icons](https://cloud.google.com/icons), Apache 2.0 as recorded by theSVG.
- Azure artwork: Microsoft, [Azure Architecture Icons](https://learn.microsoft.com/azure/architecture/icons/). Microsoft brand and icon usage terms apply.
- Other brand artwork remains the property of its respective owner. theSVG's MIT license covers its code and tooling, not a transfer of trademark rights. See [theSVG licensing](https://github.com/glincker/thesvg/blob/19107207407cd85eaebd5a84b2ba7084336c69fc/LICENSING.md).
- The local Cloudflare R2 and original service icons retain the credits in [services/SOURCES.md](services/SOURCES.md).

To regenerate the local metadata, run `bun apps/plan/scripts/sync-icons.ts` from the repository root. The script validates the catalog before writing it. Update `ICON_REVISION` in `src/lib/icons.ts` deliberately when adopting a newer upstream snapshot.
