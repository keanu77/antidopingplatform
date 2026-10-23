# Data sources and licensing scope

The repository already declared MIT in its package metadata and README; [LICENSE.md](../LICENSE.md) supplies that license text for original project code and documentation. This does not relicense third-party data, source documents, quoted passages, photographs, or trademarks.

| Material | Provenance and terms |
| --- | --- |
| Taiwan Western medicine products and composition | TFDA [license dataset](https://data.gov.tw/dataset/9122) and [composition dataset](https://data.gov.tw/dataset/9121); the recorded provider, retrieval time, hashes, and government open-data license link are in [the manifest](../data/drugs/manifest.json) |
| Archived herbal/food snapshots | Provider and terms are retained in the [herbal manifest](../data/products/herbal/manifest.json) and [food manifest](../data/products/supplements/manifest.json); these are offline archives, excluded from the public lookup build |
| Anti-doping rules and reference material | Source URLs, versions, conditions, and review status remain in the rule/evidence files and research records; the MIT code license does not grant rights to republish full WADA, federation, TADA, or other external documents |
| Educational cases | Source links and review limitations are retained with the records and [review history](data-review-history.md); public case facts are not a blanket license for quoted source text or images |
| Dependencies | Each dependency retains its own upstream license |

When reusing a dataset, follow the terms linked in its manifest and retain source attribution and processing history. The TFDA manifest records [Government Data Open License version 1](https://data.gov.tw/license); check that source for its exact terms. Imported catalogs retain original imperfections and are not a certification of clinical completeness.

The platform is independently maintained. TADA is an optional external verification destination, not the runtime backend or an endorsement of this repository. No trademark license is granted here. The README demo uses this project's interface and public product records, not a copy of TADA's interface.
