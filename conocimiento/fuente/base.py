# -*- coding: utf-8 -*-
"""Ayudas para declarar el banco de preguntas de NEMEQUI en forma compacta."""
INTENCIONES = []
CATEGORIAS = ["comprender", "funcionamiento", "datos", "metodologia", "fuentes", "navegacion", "limites", "conversacion"]
TIPO_POR_CAT = {"comprender": "info", "funcionamiento": "info", "metodologia": "info", "fuentes": "info",
                "datos": "datos", "navegacion": "navegacion", "limites": "limite", "conversacion": "conversacion"}


def _enlaces(txt):
    out = []
    for par in [p for p in txt.split(";") if p.strip()]:
        t, h = par.split("|", 1)
        out.append({"texto": t.strip(), "hash": h.strip()})
    return out


def I(id, cat, F, R="", L="", S="", H=None, T=None, A=None, req=None):
    """F: formulaciones separadas por '|' (la primera es la pregunta canónica).
    R: respuesta con marcadores {{ruta|fmt}}. L: enlaces 'texto|#/hash;...'. S: ids de intenciones sugeridas.
    H: nombre del manejador de datos del motor. req: entidad requerida (sec, eje, meta, sec|eje)."""
    assert cat in CATEGORIAS, cat
    forms = [f.strip() for f in F.split("|") if f.strip()][:8]
    assert len(forms) >= 4, (id, len(forms))
    assert all(x["id"] != id for x in INTENCIONES), "id repetido " + id
    INTENCIONES.append({
        "id": id, "categoria": cat, "tipo": T or TIPO_POR_CAT[cat], "formulaciones": forms,
        "respuesta": R, "enlaces": _enlaces(L), "sugerencias": [s.strip() for s in S.split(",") if s.strip()],
        "handler": H, "acciones": A or [], "req": req,
    })
