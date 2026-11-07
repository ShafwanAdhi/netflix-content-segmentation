# Task 4 — Content segmentation results

Run `20261106T115043590368Z`. **kmeans**, **k=10**, selected by mean silhouette across three seeds.

8,783 unique title/type/year entities from 8,790 raw rows; 7 repeated entity rows removed. 133 weighted feature dimensions. Ratings, title, ID, director and date-added are excluded from fitting.

Internal scores use a fixed random sample of 1500 titles in the full weighted feature space. PCA is visualization only; its two components explain 25.9% of feature variance.

## Candidate comparison

| Algorithm | k | Silhouette mean | Std | Davies-Bouldin ↓ | Calinski-Harabasz ↑ | Seed ARI ↑ | Eligible |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| kmeans | 2 | 0.1662 | 0.0000 | 2.267 | 248.8 | 1.000 | True |
| kmeans | 3 | 0.1493 | 0.0000 | 2.358 | 219.7 | 1.000 | True |
| kmeans | 4 | 0.1745 | 0.0118 | 2.254 | 194.6 | 0.833 | True |
| kmeans | 5 | 0.1867 | 0.0088 | 2.114 | 182.5 | 0.796 | True |
| kmeans | 6 | 0.1939 | 0.0014 | 2.137 | 172.5 | 0.666 | True |
| kmeans | 7 | 0.2102 | 0.0117 | 1.953 | 167.6 | 0.625 | True |
| kmeans | 8 | 0.2180 | 0.0039 | 1.871 | 163.2 | 0.833 | True |
| kmeans | 9 | 0.2266 | 0.0044 | 1.829 | 158.1 | 0.559 | True |
| kmeans | 10 | 0.2408 | 0.0034 | 1.734 | 160.1 | 0.662 | True |
| minibatch_kmeans | 2 | 0.1563 | 0.0140 | 2.360 | 240.6 | 0.567 | True |
| minibatch_kmeans | 3 | 0.1603 | 0.0032 | 2.302 | 199.0 | 0.612 | True |
| minibatch_kmeans | 4 | 0.1683 | 0.0077 | 2.185 | 192.5 | 0.689 | True |
| minibatch_kmeans | 5 | 0.1656 | 0.0212 | 2.192 | 170.7 | 0.555 | True |
| minibatch_kmeans | 6 | 0.1866 | 0.0125 | 2.098 | 163.8 | 0.539 | True |
| minibatch_kmeans | 7 | 0.2021 | 0.0051 | 2.068 | 162.3 | 0.571 | True |
| minibatch_kmeans | 8 | 0.2242 | 0.0073 | 1.958 | 156.5 | 0.616 | True |
| minibatch_kmeans | 9 | 0.2168 | 0.0182 | 1.862 | 154.3 | 0.561 | True |
| minibatch_kmeans | 10 | 0.2251 | 0.0191 | 1.845 | 144.5 | 0.494 | True |
| gaussian_mixture | 2 | 0.1303 | 0.0508 | 2.823 | 195.8 | 0.435 | True |
| gaussian_mixture | 3 | 0.1489 | 0.0082 | 2.307 | 191.9 | 0.523 | True |
| gaussian_mixture | 4 | 0.1449 | 0.0149 | 2.351 | 168.9 | 0.426 | True |
| gaussian_mixture | 5 | 0.1205 | 0.0119 | 2.781 | 139.6 | 0.444 | True |
| gaussian_mixture | 6 | 0.1148 | 0.0136 | 2.916 | 131.2 | 0.391 | True |
| gaussian_mixture | 7 | 0.1058 | 0.0179 | 2.795 | 115.4 | 0.307 | True |
| gaussian_mixture | 8 | 0.1255 | 0.0076 | 2.888 | 114.0 | 0.478 | True |
| gaussian_mixture | 9 | 0.1187 | 0.0102 | 2.825 | 107.3 | 0.539 | True |
| gaussian_mixture | 10 | 0.1150 | 0.0290 | 2.820 | 96.7 | 0.482 | True |

## Cluster profiles

### Cluster 0 — Stand-Up Comedy / Music & Musicals

343 titles (3.9%); 343 Movies / 0 TV Shows. Median release year 2017. Film minutes: 65.0; TV seasons: None.

Top genres: Stand-Up Comedy (343), Music & Musicals (7), Documentaries (2).

Top countries: United States (223), United Kingdom (22), Mexico (18), Not Given (13), Brazil (9).

Nearest-centroid examples: Patton Oswalt: Talking for Clapping; Theo Von: No Offense; Hannibal Buress: Comedy Camisado; Joe Rogan: Triggered; Dana Carvey: Straight White Male, 60.

### Cluster 1 — Dramas / International Movies

1914 titles (21.8%); 1914 Movies / 0 TV Shows. Median release year 2016. Film minutes: 108.5; TV seasons: None.

Top genres: Dramas (1914), International Movies (1208), Independent Movies (582), Romantic Movies (278), Thrillers (253).

Top countries: United States (522), India (503), United Kingdom (117), Not Given (61), France (60).

Nearest-centroid examples: Doctor Bello; Killa; Vitti Dandu; Rahasya; Ringan.

### Cluster 2 — International TV Shows / Docuseries

1359 titles (15.5%); 0 Movies / 1359 TV Shows. Median release year 2018. Film minutes: None; TV seasons: 1.0.

Top genres: International TV Shows (834), Docuseries (390), Crime TV Shows (286), Reality TV (253), Romantic TV Shows (250).

Top countries: United States (356), United Kingdom (191), Pakistan (179), Japan (137), South Korea (115).

Nearest-centroid examples: White Rabbit Project; Taco Chronicles; First Team: Juventus; Move; Age of Samurai: Battle for Japan.

### Cluster 3 — Action & Adventure / International Movies

636 titles (7.2%); 636 Movies / 0 TV Shows. Median release year 2013. Film minutes: 106.0; TV seasons: None.

Top genres: Action & Adventure (636), International Movies (190), Sci-Fi & Fantasy (125), Comedies (108), Dramas (91).

Top countries: United States (315), India (58), Japan (48), United Kingdom (45), Hong Kong (30).

Nearest-centroid examples: End of Watch; Act of Valor; Takers; El último testigo; 6 Bullets.

### Cluster 4 — Children & Family Movies / Comedies

584 titles (6.6%); 584 Movies / 0 TV Shows. Median release year 2016. Film minutes: 86.0; TV seasons: None.

Top genres: Children & Family Movies (584), Comedies (265), Dramas (72), Music & Musicals (38), Sci-Fi & Fantasy (19).

Top countries: United States (322), India (49), Not Given (47), Canada (40), United Kingdom (18).

Nearest-centroid examples: The Pirate Fairy; Tinker Bell and the Legend of the NeverBeast; Monster High: Haunted; Monster High: Freaky Fusion; Monster High: Frights, Camera, Action!.

### Cluster 5 — Kids' TV / TV Comedies

556 titles (6.3%); 0 Movies / 556 TV Shows. Median release year 2018. Film minutes: None; TV seasons: 2.0.

Top genres: Kids' TV (448), TV Comedies (233), British TV Shows (31), Stand-Up Comedy & Talk Shows (27), Anime Series (24).

Top countries: United States (287), Pakistan (78), Canada (36), United Kingdom (32), France (24).

Nearest-centroid examples: Richie Rich; We Bare Bears; Pac-Man and the Ghostly Adventures; Sam & Cat; Prince of Peoria.

### Cluster 6 — Comedies / International Movies

1222 titles (13.9%); 1222 Movies / 0 TV Shows. Median release year 2016. Film minutes: 104.0; TV seasons: None.

Top genres: Comedies (1172), International Movies (849), Dramas (342), Romantic Movies (298), Music & Musicals (92).

Top countries: United States (313), India (276), Egypt (62), Turkey (56), Not Given (43).

Nearest-centroid examples: What the Fish; Fun Mom Dinner; Bhaji In Problem; Santa Banta Pvt Ltd; Shahanpan Dega Deva.

### Cluster 7 — Documentaries / International Movies

864 titles (9.8%); 864 Movies / 0 TV Shows. Median release year 2017. Film minutes: 86.0; TV seasons: None.

Top genres: Documentaries (864), International Movies (293), Music & Musicals (126), Sports Movies (114), LGBTQ Movies (33).

Top countries: United States (455), United Kingdom (103), Not Given (52), Canada (33), France (27).

Nearest-centroid examples: The House on Coco Road; Defying the Nazis: The Sharps' War; Sky Ladder: The Art of Cai Guo-Qiang; Minimalism: A Documentary About the Important Things; Vegas Baby.

### Cluster 8 — TV Dramas / International TV Shows

747 titles (8.5%); 0 Movies / 747 TV Shows. Median release year 2018. Film minutes: None; TV seasons: 1.0.

Top genres: TV Dramas (747), International TV Shows (512), Crime TV Shows (180), Romantic TV Shows (120), TV Comedies (101).

Top countries: United States (201), Pakistan (92), South Korea (37), Taiwan (30), United Kingdom (28).

Nearest-centroid examples: Footprints in the Sand; Wake Up; The Confrontation; 9-Feb; Mere Papa Hero Hiralal.

### Cluster 9 — Thrillers / Horror Movies

558 titles (6.4%); 558 Movies / 0 TV Shows. Median release year 2017. Film minutes: 94.0; TV seasons: None.

Top genres: Thrillers (309), Horror Movies (297), International Movies (206), Independent Movies (77), Movies (53).

Top countries: United States (245), India (63), United Kingdom (42), Canada (28), Not Given (23).

Nearest-centroid examples: Paranormal Investigation; The Vatican Tapes; Green Room; 13 Sins; As Above, So Below.

## Interpretation and limitations

These are descriptive catalog groups, not verified audience segments or popularity classes. Feature weights define similarity; changing them can change groups. Internal metrics compare geometric compactness and separation, not human semantic correctness. Seed ARI measures initialization sensitivity on the same catalog, not resampling stability or future performance. Cluster IDs are arbitrary. The PCA sample is proportional by group and is not the full catalog; overlap in 2D can conceal separation in higher dimensions. The selected k is at the upper boundary of the tested range 2-10, so it is best within this comparison, not a globally optimal group count. Genre/country counts are multi-label and can sum beyond group size. No classifier accuracy, holdout-generalization claim, or calibrated membership probability is reported.
