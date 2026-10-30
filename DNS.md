# DNS para publicar permianlocalseo.com en GitHub Pages (lo hace Carlos en Porkbun → DNS Records)

## Borrar (son el "site preview" de Porkbun)
- A   permianlocalseo.com    → 192.0.79.153
- A   permianlocalseo.com    → 192.0.79.181
- A   *.permianlocalseo.com  → 192.0.79.153
- A   *.permianlocalseo.com  → 192.0.79.181

## Añadir
| Type  | Host | Answer |
|---|---|---|
| A     | (vacío = apex) | 185.199.108.153 |
| A     | (vacío) | 185.199.109.153 |
| A     | (vacío) | 185.199.110.153 |
| A     | (vacío) | 185.199.111.153 |
| CNAME | www | vargascoronac1-afk.github.io |

## NO tocar
MX, TXT (spf), _dmarc, default._domainkey, _acme-challenge. El correo sigue igual.
