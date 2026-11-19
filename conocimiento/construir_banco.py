# -*- coding: utf-8 -*-
"""Construye banco_preguntas.json (y banco_preguntas.js para el navegador) a partir de conocimiento/fuente/*.py.

Uso:  python3 03_scripts/portal/conocimiento/construir_banco.py
El banco es conocimiento puro (preguntas, respuestas con marcadores {{...}}, entidades y sinónimos).
Las cifras NO están aquí: el motor (js/motor.js) las calcula desde window.PDM.
"""
import json, os, re, sys, datetime

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "fuente"))
import base  # noqa
import parte1, parte2, parte3  # noqa  (al importarse registran sus intenciones)

# ----------------------------------------------------------------- entidades
SECRETARIAS = {
    "secretaria-gobierno": ["secretaría de gobierno", "gobierno", "sec gobierno", "secretaria gobierno"],
    "secretaria-hacienda": ["secretaría de hacienda", "hacienda", "sec hacienda", "hacienda pública"],
    "secretaria-educacion": ["educación, cultura, recreación y deporte", "educación cultura recreación y deporte", "educación y cultura", "secretaría de educación", "educación", "recreación", "ecrd", "sec educación"],
    "secretaria-obras-publicas": ["secretaría de obras públicas", "obras públicas", "obras publicas", "obras", "sop"],
    "secretaria-planeacion-servicios-publicos": ["planeación y servicios públicos", "secretaría de planeación", "planeación", "servicios públicos", "spsp", "planeacion y sp"],
    "secretaria-desarrollo-agropecuario": ["desarrollo agropecuario, económico y ambiente", "desarrollo agropecuario", "desarrollo económico", "agropecuario", "sdae", "secretaría agropecuaria"],
    "secretaria-desarrollo-social": ["secretaría de desarrollo social", "desarrollo social", "sds", "secretaría social"],
    "secretaria-desarrollo-institucional": ["secretaría de desarrollo institucional", "desarrollo institucional", "sdi"],
    "secretaria-general": ["secretaría general", "sec general"],
}
EJES = {
    1: ["seguridad", "gachancipá con la seguridad"],
    2: ["desarrollo social y cultural", "social y cultural", "cultural", "gachancipá con desarrollo social"],
    3: ["gestión deportiva", "deportiva", "gachancipá con gestión deportiva"],
    4: ["medio ambiente", "gachancipá con el medio ambiente"],
    5: ["prosperidad", "gachancipá con prosperidad"],
    6: ["planificada y sostenible", "planificada", "sostenible", "gachancipá planificada"],
    7: ["agropecuaria e industrial", "industrial", "agropecuaria e industrial"],
    8: ["gestión del riesgo", "riesgo", "gestion del riesgo"],
    9: ["transparencia y gestión institucional", "transparencia", "gestión institucional"],
    10: ["recuperación del río bogotá", "río bogotá", "rio bogota", "recuperación del río"],
}
# alias que pueden ser secretaría o eje: sin pista (palabra «eje» o «secretaría») se pide aclarar, salvo que haya defecto
AMBIGUOS = [
    {"alias": "social", "sec": "secretaria-desarrollo-social", "eje": 2, "defecto": None},
    {"alias": "cultura", "sec": "secretaria-educacion", "eje": 2, "defecto": None},
    {"alias": "deporte", "sec": "secretaria-educacion", "eje": 3, "defecto": None},
    {"alias": "deportes", "sec": "secretaria-educacion", "eje": 3, "defecto": None},
    {"alias": "ambiente", "sec": "secretaria-desarrollo-agropecuario", "eje": 4, "defecto": None},
    {"alias": "agropecuaria", "sec": "secretaria-desarrollo-agropecuario", "eje": 7, "defecto": "eje"},
]
NUMEROS = {"uno": 1, "una": 1, "primer": 1, "primero": 1, "dos": 2, "segundo": 2, "tres": 3, "tercer": 3, "tercero": 3,
           "cuatro": 4, "cuarto": 4, "cinco": 5, "quinto": 5, "seis": 6, "sexto": 6, "siete": 7, "septimo": 7,
           "ocho": 8, "octavo": 8, "nueve": 9, "noveno": 9, "diez": 10, "decimo": 10}

# ----------------------------------------------------------------- normalización
FRASES = [  # (regex sobre texto normalizado, sustituto)
    [r"\bp ?/? ?np\b", " pnp "],
    [r"\bno programad[oa]s?\b|\bsin programacion\b|\bno planead[oa]s?\b|\bno planificad[oa]s?\b|\bnp\b|\bgris(?:es)?\b", " noprog "],
    [r"\bno (?:esta|este|estan|sea|son|es|fue|han sido) (?:programad[oa]s?|planead[oa]s?)\b", " noprog "],
    [r"\ben avance\b|\bavanzando\b|\bamarill[oa]s?\b|\bambar\b", " enavance "],
    [r"\brezagad[oa]s?\b|\batrasad[oa]s?\b|\bretrasad[oa]s?\b|\bcriticas?\b|\ben rojo\b|\brojas?\b|\brojos?\b", " rezagada "],
    [r"\bcumplid[oa]s?\b|\bcompletad[oa]s?\b|\blograd[oa]s?\b|\blogros?\b|\bverdes?\b", " cumplida "],
    [r"\bcertificab\w+|\bcertificar\w*|\bcertificad\w+|\bcertificacion\b", " certificable "],
    [r"\bplan de desarrollo(?: municipal)?\b", " pdm "],
    [r"\bpor ciento\b|\bporciento\b|\bpor cien\b", " porcentaje "],
    [r"\bmas alt[oa]s?\b|\bmayor(?:es)?\b|\bmejor(?:es)?\b|\blidera\b|\bmaximo\b", " mayor "],
    [r"\bmas baj[oa]s?\b|\bmenor(?:es)?\b|\bpeor(?:es)?\b|\bultim[oa]s?\b|\bminimo\b", " menor "],
    [r"\bquiere decir\b|\bquieren decir\b", " significa "],
    [r"\bmedio ambiente\b", " medioambiente "],
    [r"\b(donde|como|puedo|quiero|necesito) bajo\b", " $1 descargar "],
    [r"\bmodo (?:claro|clara)\b|\bfondo (?:claro|clara)\b|\btema (?:claro|clara)\b", " modo dia "],
    [r"\bpagina web\b|\bsitio web\b", " portal "],
    [r"\bsolo una pagina\b|\buna sola pagina\b", " unapagina "],
]
PALABRAS = {  # palabra -> canónica (antes de la lematización)
    "avance": "indicador", "avances": "indicador", "porcentaje": "indicador", "porcentajes": "indicador", "clicable": "clic", "clicables": "clic", "interactivo": "clic", "interactivos": "clic", "interactiva": "clic", "resultado": "indicador",
    "resultados": "indicador", "desempeno": "indicador", "calificacion": "indicador", "puntaje": "indicador",
    "cifra": "dato", "cifras": "dato", "datos": "dato", "informacion": "dato", "numeros": "dato",
    "dependencia": "secretaria", "dependencias": "secretaria", "despacho": "secretaria",
    "tablero": "portal", "dashboard": "portal", "panel": "portal", "sitio": "portal", "plataforma": "portal", "herramienta": "portal",
    "aplicacion": "portal", "objetivo": "meta", "objetivos": "meta", "compromiso": "meta",
    "global": "institucional", "alcaldia": "institucional",
    "entidad": "institucional", "institucion": "institucional",
    "llevame": "ir", "abre": "ir", "abrir": "ir", "dirigeme": "ir", "vamos": "ir", "navega": "ir", "ve": "ir", "ir": "ir", "abreme": "ir",
    "muestrame": "mostrar", "muestra": "mostrar", "mostrar": "mostrar", "ensename": "mostrar", "dame": "mostrar", "dime": "mostrar",
    "ver": "mostrar", "lista": "mostrar", "listar": "mostrar", "listame": "mostrar", "enumera": "mostrar",
    "cuantos": "cuanto", "cuantas": "cuanto", "cuanta": "cuanto", "cantidad": "cuanto",
    "descarga": "descargar", "descargar": "descargar", "descargo": "descargar", "bajar": "descargar", "baja": "descargar",
    "exportar": "descargar", "exporta": "descargar", "exporto": "descargar", "guardar": "descargar", "guardo": "descargar", "descargas": "descargar",
    "grafica": "grafico", "graficos": "grafico", "graficas": "grafico", "diagrama": "grafico", "diagramas": "grafico",
    "barras": "grafico", "torta": "grafico", "anillo": "grafico", "dona": "grafico",
    "funciona": "usar", "funcionar": "usar", "funcionan": "usar", "operar": "usar", "uso": "usar", "utilizar": "usar", "utiliza": "usar",
    "usa": "usar", "usar": "usar", "manejo": "usar", "manejar": "usar", "uso": "usar", "uso": "usar", "empleo": "usar",
    "color": "semaforo", "colores": "semaforo", "semaforizacion": "semaforo",
    "umbrales": "umbral", "rango": "umbral", "rangos": "umbral", "criterio": "umbral", "criterios": "umbral", "regla": "umbral", "reglas": "umbral",
    "explica": "explicar", "explicame": "explicar", "aclara": "explicar", "aclarar": "explicar", "aclaras": "explicar", "explicas": "explicar",
    "significado": "significa", "significan": "significa", "representa": "significa", "representan": "significa", "significar": "significa",
    "sirve": "sirve", "sirven": "sirve", "utilidad": "sirve", "util": "sirve", "beneficio": "sirve", "beneficios": "sirve", "servir": "sirve",
    "calcula": "calcula", "calcular": "calcula", "calculo": "calcula", "calculan": "calcula", "calculado": "calcula", "calcularon": "calcula",
    "general": "institucional", "colaborar": "ayuda", "colaboras": "ayuda", "colabora": "ayuda", "apoyar": "ayuda", "apoyas": "ayuda", "asistir": "ayuda", "asistes": "ayuda", "promedio": "media", "promedios": "media", "saca": "calcula", "sacan": "calcula", "sacar": "calcula", "formula": "calcula", "operacion": "calcula", "mide": "calcula", "miden": "calcula", "medir": "calcula",
    "chao": "adios", "bye": "adios", "hola": "hola", "ey": "hola", "hey": "hola", "saludos": "hola", "buenas": "hola",
    "ayudame": "ayuda", "ayudar": "ayuda", "ayudas": "ayuda", "ayudan": "ayuda", "ayudarme": "ayuda",
    "vigencias": "vigencia", "ano": "vigencia", "anos": "vigencia",
    "imprime": "imprimir", "imprimo": "imprimir", "impresion": "imprimir", "impresora": "imprimir",
    "oscuro": "noche", "oscura": "noche", "nocturno": "noche",
    "metas": "meta", "ejes": "eje",
}
STOP = ["a", "al", "algo", "ante", "con", "de", "del", "el", "la", "lo", "los", "las", "un", "una", "unos", "unas", "y", "o", "u", "e",
        "en", "me", "te", "se", "mi", "tu", "su", "sus", "mis", "tus", "ese", "esa", "eso", "este", "esta", "esto", "estos", "estas", "le", "les", "nos",
        "es", "son", "ser", "hay", "ya", "tan", "muy", "mas", "tambien", "solo", "ha", "han", "he"]
RELLENO = ["nemequi", "oye", "favor", "porfa", "porfavor", "quisiera", "quiero", "queria", "saber", "podrias", "podria", "puedes", "puede", "pudieras",
           "decir", "gustaria", "disculpa", "perdon", "pues", "entonces", "bueno", "ok", "hola", "buenos", "dias", "tardes", "noches", "gracias", "mil", "doctora", "amiga",
           "duda", "una"]

# ----------------------------------------------------------------- preguntas por página
POR_PAGINA = {
    "resumen": ["resumen_general", "ind_inst", "colores_semaforo", "rezagadas_lista", "clic_graficos", "filtros_globales"],
    "ejes": ["lista_ejes", "mayor_eje", "menor_eje", "eje_vs_institucional", "ranking_eje", "que_es_eje"],
    "eje": ["ind_eje", "secs_de_eje", "rezagadas_lista", "eje_vs_institucional", "que_es_eje"],
    "secretarias": ["ranking_sec", "mayor_sec", "menor_sec", "no_es_calificacion", "calculo_institucional", "sobre_inst"],
    "secretaria": ["ind_sec", "metas_sec", "informe_sec_dl", "ejes_de_sec", "calculo_secretaria_eje"],
    "metas": ["buscar_explorador", "filtrar_explorador", "filtro_vigencia", "ordenar_explorador", "exportar_csv", "compartir_enlace"],
    "meta": ["como_se_calcula", "colores_semaforo", "meta_compartida", "etiquetas_metas", "arrastre"],
    "logros": ["meta_certificable", "t4_pendiente", "certificables_datos", "cumplida_vs_certificable"],
    "alertas": ["que_es_rezagada", "rezagadas_lista", "por_que_no_penaliza", "no_programadas_lista", "lim_causas"],
    "compartidas": ["meta_compartida", "registros_vs_unicas", "arrastre", "mayor_100"],
    "informes": ["descargar_informes", "informes_anio", "word_vs_pdf", "informe_general_dl"],
    "metodologia": ["como_se_calcula", "calculo_institucional", "umbrales", "glosario", "huellas", "fuentes_datos"],
    "defecto": ["que_es_portal", "resumen_general", "colores_semaforo", "como_se_calcula", "que_puedes_hacer"],
}
INICIO = ["que_es_portal", "resumen_general", "colores_semaforo", "rezagadas_lista", "como_se_calcula", "menu_como"]


def main():
    ids = {i["id"] for i in base.INTENCIONES}
    errores = []
    for i in base.INTENCIONES:
        for s in i["sugerencias"]:
            if s not in ids:
                errores.append("sugerencia desconocida %s en %s" % (s, i["id"]))
        if not i["handler"] and not i["respuesta"]:
            errores.append("sin respuesta ni handler: " + i["id"])
    for k, lst in list(POR_PAGINA.items()) + [("inicio", INICIO)]:
        for s in lst:
            if s not in ids:
                errores.append("pagina %s: id desconocido %s" % (k, s))
    if errores:
        print("\n".join(errores)); sys.exit(1)

    pagina = {k: v for k, v in POR_PAGINA.items()}
    banco = {
        "version": 1,
        "generado": datetime.date.today().isoformat(),
        "nota": "Conocimiento de NEMEQUI. Sin cifras: el motor las calcula desde window.PDM. Marcadores {{ruta|fmt}}.",
        "categorias": base.CATEGORIAS,
        "entidades": {"secretarias": SECRETARIAS, "ejes": {str(k): v for k, v in EJES.items()}, "ambiguos": AMBIGUOS, "numeros": NUMEROS},
        "normalizacion": {"frases": FRASES, "palabras": PALABRAS, "stop": STOP, "relleno": RELLENO},
        "inicio": INICIO,
        "por_pagina": pagina,
        "intenciones": base.INTENCIONES,
    }
    with open(os.path.join(AQUI, "banco_preguntas.json"), "w", encoding="utf-8") as f:
        json.dump(banco, f, ensure_ascii=False, indent=1)
    with open(os.path.join(AQUI, "banco_preguntas.js"), "w", encoding="utf-8") as f:
        f.write("/* Generado por conocimiento/construir_banco.py. No editar a mano. */\nwindow.NEMEQUI_BANCO = ")
        json.dump(banco, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    nform = sum(len(i["formulaciones"]) for i in base.INTENCIONES)
    por_cat = {}
    for i in base.INTENCIONES:
        por_cat.setdefault(i["categoria"], [0, 0]); por_cat[i["categoria"]][0] += 1; por_cat[i["categoria"]][1] += len(i["formulaciones"])
    print("intenciones:", len(base.INTENCIONES), "formulaciones:", nform)
    for k, v in por_cat.items():
        print("  %-15s intenciones=%d formulaciones=%d" % (k, v[0], v[1]))
    menos = [i["id"] for i in base.INTENCIONES if len(i["formulaciones"]) < 4]
    print("con menos de 4:", menos)


if __name__ == "__main__":
    main()
