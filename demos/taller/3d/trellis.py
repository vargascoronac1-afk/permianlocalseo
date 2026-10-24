"""Prueba TRELLIS (NVIDIA NIM hosted). La clave se lee de sistema/.env y nunca se imprime."""
import base64, io, json, re, sys, time
import requests
from PIL import Image

ENV = r"E:\Proyectos\sistema\.env"
URL = "https://ai.api.nvidia.com/v1/genai/microsoft/trellis"
OUT = r"E:\Proyectos\web\demos\taller\3d"
MAXB64 = 170_000  # limite inline ~180 KB

key = None
for line in open(ENV, encoding="utf-8"):
    m = re.match(r"\s*NVIDIA_API_KEY\s*=\s*(.*)", line)
    if m: key = m.group(1).strip().strip('"\'')
if not key: sys.exit("sin clave")

def prep(path, white=True):
    im = Image.open(path)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA"); bg = Image.new("RGBA", im.size, (255,255,255,255)); bg.alpha_composite(im); im = bg
    im = im.convert("RGB")
    side = 1024
    while True:
        t = im.copy(); t.thumbnail((side, side))
        for q in (90, 80, 70, 60, 50):
            b = io.BytesIO(); t.save(b, "JPEG", quality=q)
            if len(base64.b64encode(b.getvalue())) <= MAXB64:
                return b.getvalue(), t.size, q
        side = int(side * 0.8)

def run(tag, path):
    data, size, q = prep(path)
    h = {"Authorization": "Bearer " + key, "Accept": "application/json"}
    a = requests.post("https://api.nvcf.nvidia.com/v2/nvcf/assets", headers={**h, "Content-Type": "application/json"},
                      json={"contentType": "image/jpeg", "description": "trellis input"}, timeout=60)
    print(tag, "assets", a.status_code)
    if a.status_code != 200: print(tag, "ERROR", a.text[:400].replace(key, "***")); return None
    aj = a.json()
    up = requests.put(aj["uploadUrl"], data=data, headers={"Content-Type": "image/jpeg",
        "x-amz-meta-nvcf-asset-description": "trellis input"}, timeout=120)
    print(tag, "upload", up.status_code)
    h["NVCF-INPUT-ASSET-REFERENCES"] = aj["assetId"]
    payload = {"image": "data:image/jpeg;asset_id," + aj["assetId"],
               "slat_cfg_scale": 3, "ss_cfg_scale": 7.5, "slat_sampling_steps": 25,
               "ss_sampling_steps": 25, "seed": 0}
    t0 = time.time()
    r = requests.post(URL, headers=h, json=payload, timeout=600)
    # asincrono: 202 + NVCF-REQID
    while r.status_code == 202:
        rid = r.headers.get("NVCF-REQID")
        print(tag, "202 polling", rid, f"{time.time()-t0:.0f}s")
        time.sleep(5)
        r = requests.get("https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/" + rid, headers=h, timeout=600)
    dt = time.time() - t0
    print(tag, "HTTP", r.status_code, f"{dt:.1f}s", "img", size, "jpegq", q, len(data), "bytes")
    if r.status_code != 200:
        print(tag, "ERROR", r.text[:500].replace(key, "***")); return None
    ctype = r.headers.get("content-type", "")
    print(tag, "content-type", ctype, "len", len(r.content))
    glb = None
    if "json" in ctype:
        j = r.json()
        print(tag, "claves JSON:", list(j.keys()))
        arts = j.get("artifacts") or []
        for a in arts:
            print(tag, "artifact claves:", list(a.keys()), a.get("finishReason"))
            b = a.get("base64") or a.get("data")
            if b: glb = base64.b64decode(b)
    else:
        glb = r.content
    if glb:
        fn = f"{OUT}\trellis-{tag}.glb"
        open(fn, "wb").write(glb)
        print(tag, "GLB", len(glb), "bytes", glb[:4], "->", fn)
    return glb

if __name__ == "__main__":
    which = sys.argv[1:] or ["foto", "recorte"]
    if "foto" in which: run("foto", r"E:\Proyectos\web\img\fuentes\truck-7873720.jpg")
    if "recorte" in which: run("recorte", r"E:\Proyectos\web\img\recortes\camioneta-1132.webp")
