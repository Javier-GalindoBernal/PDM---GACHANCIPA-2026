# -*- coding: utf-8 -*-
from base import I

# ====================================================== DATOS (las cifras las calcula el motor desde window.PDM)
C = "datos"
I("resumen_general", C, "Dame un resumen del corte|cómo vamos|resumen general|cuéntame cómo va todo|panorama general del plan|ponme al día|dame las cifras principales|cifras clave del PDM|resumen ejecutivo del plan|cómo va el plan en general",
  H="resumen")
I("ind_inst", C, "¿Cuál es el indicador institucional?|cómo va el plan de desarrollo|cuánto avance lleva el plan|cuál es el avance general|cuál es el porcentaje de avance del PDM|qué tan avanzado va el plan|indicador de la alcaldía|dame el indicador general|cuál es el resultado global|cuál es el indicador del municipio",
  H="ind_inst")
I("ind_vigencia", C, "¿Cuál fue el avance de 2025?|cuánto avanzó el plan en 2025|cuál es el avance 2026 al corte|avance de la vigencia 2026|cómo cerró 2025|cuál es el avance de este año|cuánto es el avance del año pasado",
  H="ind_inst")
I("ind_sec", C, "¿Cuál es el indicador de la Secretaría de Gobierno?|cómo va Hacienda|cuánto avance tiene Educación|dame el indicador de Obras Públicas|porcentaje de avance de Planeación|qué indicador tiene Desarrollo Social|cómo le va a la secretaría de Desarrollo Agropecuario|avance de la secretaría general|cómo va esa secretaría|qué porcentaje lleva la secretaría de Desarrollo Institucional",
  H="ind_sec", req="sec")
I("ind_eje", C, "¿Cuál es el indicador del eje 3?|cómo va el eje de Seguridad|cuánto avance tiene el eje 5|indicador del eje de Medio Ambiente|porcentaje de avance del eje 2|cómo está el eje de Transparencia|qué indicador tiene el eje 7|cómo va el eje de Gestión del Riesgo|avance del eje planificada y sostenible",
  H="ind_eje", req="eje")
I("ficha_sec", C, "Hablame de la Secretaría de Hacienda|ficha de Gobierno|resumen de Educación|información de Obras Públicas|dime todo de Planeación|cuéntame de la secretaría de Desarrollo Social|quiero saber de Desarrollo Agropecuario|datos de la Secretaría General",
  H="ficha_sec", req="sec")
I("ficha_eje", C, "Háblame del eje 2|ficha del eje de Seguridad|resumen del eje 6|información del eje de Prosperidad|dime todo del eje 9|cuéntame del eje del Río Bogotá|datos del eje 4",
  H="ficha_eje", req="eje")
I("conteo_estados", C, "¿Cuántas metas hay en cada estado?|cómo está repartido el semáforo|resumen del semáforo|distribución de metas por estado|cuántas metas hay cumplidas, en avance, rezagadas y no programadas|dame el conteo del semáforo|cuántas metas tiene cada color|cuál es el estado de las metas",
  H="conteo")
I("conteo_cumplidas", C, "¿Cuántas metas están cumplidas?|cuántas metas hay cumplidas|número de metas cumplidas|cuántas llevan el 100%|cuántas metas se han cumplido|cuántas metas cumplidas tiene Gobierno|cuántas metas cumplidas hay en el eje 2|cuántas metas cumplidas hay en total|cuántas metas verdes hay",
  H="conteo")
I("conteo_en_avance", C, "¿Cuántas metas están en avance?|cuántas metas hay en avance|número de metas en avance|cuántas metas van avanzando|cuántas metas en avance tiene Educación|cuántas metas en avance hay en el eje 6|cuántas metas en avance hay en total|cuántas metas ámbar hay",
  H="conteo")
I("conteo_rezagadas", C, "¿Cuántas metas están rezagadas?|cuántas metas hay rezagadas|número de metas rezagadas|cuántas metas van atrasadas|cuántas metas rezagadas tiene Obras Públicas|cuántas metas rezagadas hay en el eje 2|cuántas metas rezagadas hay en total|cuántas metas están en rojo|cuántas metas críticas hay",
  H="conteo")
I("conteo_no_programadas", C, "¿Cuántas metas no están programadas?|cuántas metas no programadas hay|número de metas no programadas|cuántas metas no tienen programación|cuántas metas no programadas tiene Gobierno|cuántas metas sin programación hay en el eje 6|cuántas metas sin programación hay en total|cuántas metas grises hay",
  H="conteo")
I("pct_estado", C, "¿Qué porcentaje de metas está cumplido?|qué proporción de metas está rezagada|cuánto representan las cumplidas del total|qué porcentaje de las metas está en avance|qué tanto por ciento de metas son no programadas|qué parte de las metas está cumplida",
  H="pct_estado")
I("total_metas", C, "¿Cuántas metas tiene el plan?|cuántas metas hay en total|número total de metas|cuántas metas únicas hay|cuántos registros de meta hay|cuántas metas tiene Hacienda|cuántas metas tiene el eje 3|cuántas metas se siguen",
  H="totales")
I("lista_secs", C, "¿Cuáles son las secretarías?|cuántas secretarías hay|lista de secretarías|qué secretarías participan|nombres de las secretarías|cuántas dependencias se siguen|qué secretarías reportan",
  H="lista_secs")
I("lista_ejes", C, "¿Cuáles son los ejes del plan?|cuántos ejes hay|lista de ejes estratégicos|nombres de los ejes|dime los ejes|qué ejes tiene el plan|cuántos ejes estratégicos tiene el PDM",
  H="lista_ejes")
I("metas_programadas_n", C, "¿Cuántas metas están programadas al corte?|cuántas metas tienen programación|cuántas metas entran en el promedio|cuántas metas se miden|cuántas metas están programadas|cuántas metas cuentan para el indicador",
  H="programadas")
I("mayor_sec", C, "¿Qué secretaría tiene el mayor indicador?|qué secretaría va mejor|quién tiene el indicador más alto|secretaría con mejor avance|cuál lidera|cuál es la secretaría con más avance|qué secretaría tiene el indicador más alto",
  H="extremo_sec")
I("menor_sec", C, "¿Qué secretaría tiene el menor indicador?|qué secretaría va más atrasada|secretaría con el indicador más bajo|cuál tiene menor avance|quién va de última|cuál está más abajo|qué secretaría tiene menos avance|qué secretaría va peor",
  H="extremo_sec")
I("mayor_eje", C, "¿Qué eje tiene el mayor indicador?|qué eje va mejor|cuál eje tiene el indicador más alto|eje con mejor avance|cuál es el eje que lidera|qué eje tiene más avance",
  H="extremo_eje")
I("menor_eje", C, "¿Qué eje tiene el menor indicador?|qué eje va más atrasado|cuál eje tiene el indicador más bajo|eje con menor avance|qué eje tiene menos avance|cuál es el eje más rezagado|qué eje va peor",
  H="extremo_eje")
I("ranking_sec", C, "Ranking de secretarías|ordena las secretarías por indicador|dame el ranking|clasificación de las secretarías|tabla de posiciones|secretarías de mayor a menor|quiero ver el orden de las secretarías",
  H="ranking_sec")
I("ranking_eje", C, "Ranking de ejes|ordena los ejes por indicador|clasificación de los ejes|ejes de mayor a menor|dame el orden de los ejes|tabla de posiciones de los ejes",
  H="ranking_eje")
I("extremo_estado", C, "¿Qué secretaría tiene más metas rezagadas?|cuál secretaría tiene más metas cumplidas|qué eje tiene más metas no programadas|dónde hay más rezagadas|qué secretaría tiene más metas en avance|en qué eje hay más metas cumplidas|dónde se concentran las metas rezagadas",
  H="extremo_estado")
I("rezagadas_lista", C, "¿Cuáles son las metas rezagadas?|lista de metas rezagadas|cuáles metas están en rojo|qué metas van atrasadas|qué metas hay que acompañar|metas rezagadas del eje 4|qué metas rezagadas tiene Hacienda|metas rezagadas de Obras Públicas en el eje 6",
  H="rezagadas")
I("no_programadas_lista", C, "¿Cuáles son las metas no programadas?|qué metas no tienen programación|dime las no programadas|lista de metas sin programación|cuáles metas están en gris|qué metas no tienen programación al corte de Gobierno",
  H="noprog")
I("cumplidas_lista", C, "¿Cuáles son las metas cumplidas?|qué metas están al 100%|dime las metas cumplidas|lista de logros|qué hemos logrado|cuáles metas se cumplieron|qué metas cumplidas tiene Desarrollo Social",
  H="cumplidas")
I("meta_detalle", C, "Detalle de la meta 14|qué dice la meta 14|información de la meta 17|cómo va la meta 20|estado de la meta 25|de qué trata la meta 100|la meta 17 está rezagada|consulta la meta 43",
  H="meta", req="meta")
I("meta_busqueda", C, "Busca la meta de vivienda|hay alguna meta sobre residuos|qué meta habla de acueducto|metas relacionadas con tránsito|encuentra la meta de la Policía|hay metas de biblioteca|qué metas hay sobre agua|busca metas de cultura|existe una meta sobre ciclorrutas",
  H="meta_texto")
I("metas_sec", C, "¿Qué metas tiene la Secretaría de Gobierno?|metas de la secretaría de Hacienda|muéstrame las metas de Educación|lista las metas de Obras Públicas|cuáles son las metas de Planeación|qué metas le corresponden a Desarrollo Social|metas a cargo de Desarrollo Agropecuario",
  H="metas_sec", req="sec")
I("metas_eje", C, "¿Qué metas tiene el eje 3?|metas del eje de Seguridad|muéstrame las metas del eje 5|lista las metas del eje 2|cuáles son las metas del eje de Medio Ambiente|qué metas hay en el eje 9|metas que pertenecen al eje 7",
  H="metas_eje", req="eje")
I("comparar", C, "Compara Gobierno con Hacienda|qué diferencia hay entre Educación y Obras Públicas|quién va mejor, Desarrollo Social o Planeación|compara el eje 2 y el eje 3|Gobierno contra Hacienda|comparar secretarías|diferencia entre el eje 4 y el eje 5|Gobierno vs Educación",
  H="comparar")
I("sec_vs_inst", C, "¿Cómo está Hacienda frente al indicador institucional?|está Gobierno por encima del promedio|Educación está por debajo del indicador general|Obras Públicas supera el promedio institucional|cómo se compara Planeación con el promedio|cómo está el eje 2 frente al institucional",
  H="vs_inst")
I("sobre_inst", C, "¿Qué secretarías están por encima del indicador institucional?|cuáles secretarías superan el promedio|quién está por debajo del promedio general|cuántas secretarías superan el indicador institucional|secretarías por debajo del institucional|qué ejes están por encima del promedio",
  H="sobre_inst")
I("certificables_datos", C, "¿Cuántas metas son certificables?|cuáles metas se pueden certificar|metas certificables|cuántas metas se certifican|lista de certificables|cuántas metas certificables tiene Educación|dime las metas certificables",
  H="certificables")
I("pendientes_t4", C, "¿Cuántas metas están al 100% con programación posterior?|cuántas metas tienen T4 pendiente|metas pendientes de certificar|qué metas se certifican al cierre|cuántas metas cumplidas tienen programación en el cuarto trimestre|metas cumplidas con programación posterior",
  H="pendientes")
I("compartidas_datos", C, "¿Cuáles son las metas compartidas?|cuántas metas compartidas hay|qué metas comparten varias secretarías|dime las metas compartidas|qué metas están repartidas entre secretarías|metas compartidas con valores distintos|cuántas metas son compartidas",
  H="compartidas")
I("cambio_anios", C, "¿Qué cambió entre 2025 y 2026?|cómo va 2026 frente a 2025|mejoró el avance respecto a 2025|comparación 2025 2026|el avance subió o bajó|cómo cambió el avance de Gobierno frente a 2025|cómo cambió el avance del eje 3 respecto a 2025|diferencia entre 2025 y 2026",
  H="cambio")
I("corte_datos", C, "¿Cuál es la fecha de corte?|a qué fecha están los datos|hasta qué fecha van las cifras|qué corte es este|cuál es el corte actual|cuándo se generó el portal|de qué mes son los datos|a cuándo corresponde la información",
  H="corte")
I("sobreejecucion_datos", C, "¿Cuáles metas superan el 100%?|qué metas tienen más de 100|metas con ejecución superior a la programada|cuáles metas pasan del 100 por ciento|cuántas metas tienen indicador mayor a 100|qué metas se sobreejecutaron",
  H="sobre")
I("arrastre_datos", C, "¿Cuáles metas tienen arrastre?|cuántas metas de arrastre hay|metas sin programación 2026 al corte|qué metas vienen de 2025|dime las metas con arrastre de 2025|cuántas metas tienen la marca de arrastre",
  H="arrastre")
I("verificacion_datos", C, "¿Qué meta está en verificación?|hay metas en verificación|cuál es la meta con escala mixta|metas con datos por aclarar|qué metas se están verificando con la secretaría|cuál meta tiene escala distinta",
  H="verificacion")
I("mas_metas", C, "¿Qué secretaría tiene más metas?|qué eje tiene más metas|cuál tiene menos metas|quién tiene mayor número de metas|qué secretaría tiene menos metas|cuál eje concentra más metas",
  H="mas_metas")
I("sin_rezago", C, "¿Qué secretarías no tienen metas rezagadas?|qué ejes no tienen rezagadas|dónde no hay metas en rojo|cuáles están libres de rezago|qué secretarías no tienen ninguna meta rezagada|qué ejes no tienen metas rezagadas",
  H="sin_rezago")
I("secs_de_eje", C, "¿Qué secretarías participan en el eje 2?|quiénes responden por el eje 4|qué secretarías tienen metas en el eje 5|qué secretarías están en el eje de Seguridad|quién ejecuta el eje 9|qué dependencias atienden el eje 6",
  H="secs_eje", req="eje")
I("ejes_de_sec", C, "¿En qué ejes tiene metas Gobierno?|qué ejes atiende Educación|ejes de Obras Públicas|en qué ejes participa Hacienda|a qué ejes aporta Planeación|qué ejes cubre Desarrollo Social",
  H="ejes_sec", req="sec")
I("meta_extremo", C, "¿Cuál es la meta con menor avance?|meta con mayor indicador|cuál meta va peor|meta más atrasada|cuál es la meta con más avance|qué meta tiene el indicador más bajo|cuál meta tiene el indicador más alto",
  H="meta_extremo")
I("verificar_cifra", C, "¿Es cierto que el indicador institucional es 99.9%?|verdad que Hacienda tiene 12.3%|confírmame que Gobierno está en 50%|dicen que hay 300 metas, ¿es cierto?|me dijeron que el eje 2 va en 70%, ¿correcto?|es verdad que ya se cumplió todo",
  H="verificar")
I("secs_pocas_metas", C, "¿Qué secretarías tienen pocas metas?|por qué Desarrollo Institucional tiene solo dos metas|secretarías con menos de tres metas|por qué hay secretarías con tan pocas metas|qué secretarías tienen menos metas programadas",
  H="pocas_metas")

# ====================================================== NAVEGACIÓN
C = "navegacion"
def pagina(id, forms, nombre, hash_, extra_s=""):
    I(id, C, forms, "Claro, te llevo a «%s»." % nombre, "%s|%s" % (nombre, hash_), extra_s,
      A=[{"tipo": "ir", "hash": hash_}])

pagina("ir_resumen", "Llévame al resumen|ir al inicio|abre el resumen ejecutivo|quiero ver la página principal|volver al inicio|vamos al resumen|llévame a la portada", "Resumen ejecutivo", "#/resumen", "pagina_resumen,ind_inst")
pagina("ir_ejes", "Llévame a los ejes|abre avance por eje|quiero ver los ejes estratégicos|ir a ejes|muéstrame la página de ejes|vamos a los ejes", "Avance por eje estratégico", "#/ejes", "pagina_ejes,ranking_eje")
pagina("ir_secretarias", "Llévame a las secretarías|abre la página de secretarías|quiero ver todas las secretarías|ir a secretarías|muéstrame las secretarías en tarjetas", "Secretarías", "#/secretarias", "pagina_secretarias,ranking_sec")
pagina("ir_explorador", "Llévame al explorador de metas|abre el buscador de metas|quiero ver todas las metas|ir a la tabla de metas|abre el explorador|vamos al explorador de metas", "Explorador de metas", "#/metas", "pagina_explorador,filtrar_explorador")
pagina("ir_logros", "Llévame a logros|abre la página de metas cumplidas|quiero ver los logros|ir a logros y metas cumplidas|muéstrame las metas certificables en la página de logros", "Logros y metas cumplidas", "#/logros", "meta_certificable,certificables_datos")
pagina("ir_alertas", "Llévame a las alertas|abre la página de alertas|quiero ver las alertas|ir a alertas|vamos a las metas por acompañar", "Alertas", "#/alertas", "rezagadas_lista,pagina_alertas")
pagina("ir_compartidas", "Llévame a metas compartidas|abre calidad de dato|quiero ver las metas compartidas en su página|ir a metas compartidas y calidad de dato|muéstrame la página de arrastre", "Metas compartidas y calidad de dato", "#/compartidas", "meta_compartida,arrastre")
pagina("ir_informes", "¿Dónde descargo los informes?|llévame a informes|abre la página de informes|ir a descargas|quiero ver los informes|dónde está la sección de informes", "Informes", "#/informes", "descargar_informes,informes_anio")
pagina("ir_metodologia", "Llévame a metodología|abre metodología y fuentes|dónde se explica la metodología|ir a la metodología|llévame al glosario|abre el glosario del portal", "Metodología y fuentes", "#/metodologia", "como_se_calcula,glosario")
I("ir_tablero", C, "Abre el tablero de control|ir al tablero de una página|llévame al dashboard simple|quiero ver el tablero de una sola página|abre tablero.html|llévame al tablero con filtros por vigencia",
  "Te dejo el enlace al tablero de control de una sola página.", "Tablero de una sola página|tablero.html", "tablero_una_pagina,ambas_distinto",
  A=[{"tipo": "abrir", "href": "tablero.html"}])
I("ir_sec", C, "Llévame a la Secretaría de Gobierno|abre la ficha de Hacienda|quiero ver la página de Educación|ir a Obras Públicas|muéstrame la secretaría de Planeación|abre la página de Desarrollo Social|llévame a la ficha de Desarrollo Agropecuario",
  H="nav_sec", req="sec")
I("ir_eje", C, "Llévame al eje 3|abre el eje de Seguridad|ir al eje 5|ver la página del eje 2|muéstrame el eje de Transparencia|abre el eje 9|llévame al eje de Medio Ambiente",
  H="nav_eje", req="eje")
I("ir_meta", C, "Llévame a la meta 14|abre la meta 17|ir a la meta 20|ver la página de la meta 33|abre el detalle de la meta 100|muéstrame la meta 5 en su página",
  H="nav_meta", req="meta")
I("informe_general_dl", C, "¿Dónde descargo el informe de gestión?|descargar informe general|quiero el informe general en PDF|dame el informe consolidado|dónde está el informe de gestión 2026|descarga el informe general en Word",
  H="informe_general")
I("informe_sec_dl", C, "¿Dónde descargo el informe de Gobierno?|descargar el informe de Educación|quiero el PDF de Obras Públicas|informe de seguimiento de Hacienda en Word|dónde está el informe de Planeación|bajar el informe de Desarrollo Social|necesito el informe de la secretaría general",
  H="informe_sec", req="sec")
I("ver_metas_estado", C, "Muéstrame solo las metas rezagadas|quiero ver las metas cumplidas en el explorador|filtra las metas en avance|llévame a las metas no programadas|abre las metas rezagadas de Educación|filtra las metas cumplidas de Gobierno en el explorador|ver en el explorador las metas del eje 2",
  H="nav_metas")
I("accion_csv", C, "Exporta las metas a CSV|descarga el CSV|exporta lo filtrado|descarga la tabla en Excel ahora|exporta las metas rezagadas|saca el CSV de las metas de Gobierno",
  H="accion_csv")
I("accion_tema", C, "Pon el modo noche|activa el modo oscuro|cambia a modo día|quita el modo oscuro|cambia el tema|ponme el fondo claro|activa el modo claro|modo oscuro por favor",
  H="accion_tema")
I("accion_imprimir", C, "Imprime esta página|quiero imprimir|manda a imprimir|imprime lo que estoy viendo|imprimir ahora|abre el diálogo de impresión",
  "Abriré el diálogo de impresión; allí también puedes elegir «Guardar como PDF».", "", "descargar_informes,word_vs_pdf", A=[{"tipo": "imprimir"}])
I("accion_limpiar", C, "Limpia los filtros|quita todos los filtros|borra los filtros|reinicia los filtros|deja el explorador sin filtros|resetea los filtros",
  "Listo, limpio los filtros para que veas todas las metas.", "Explorador de metas|#/metas", "pagina_explorador,filtrar_explorador", A=[{"tipo": "limpiar_filtros"}])

# ====================================================== LÍMITES
C = "limites"
CONS = "Si necesitas ese dato, consúltalo con la secretaría responsable o con Planeación y Servicios Públicos."
I("lim_presupuesto", C, "¿Cuánto presupuesto tiene la secretaría?|cuánto se ha invertido en vivienda|cuánto dinero se gastó|presupuesto asignado a cada meta|recursos ejecutados|cuál es el presupuesto del plan|cuánto cuesta esta meta|ejecución presupuestal|cuánta plata hay|cuánto se pagó en la meta 14",
  "El portal no contiene información presupuestal ni financiera: solo mide el avance físico de las metas frente a lo programado. Para presupuesto o ejecución de recursos, consulta a la Secretaría de Hacienda o a Planeación y Servicios Públicos.",
  "", "ind_inst,que_es_indicador")
I("lim_contratos", C, "¿Qué contratos tiene esta meta?|quién es el contratista|cuántos contratos se firmaron|valor del contrato|qué proyecto de inversión financia la meta|cuál es el BPIN|qué contratistas ejecutan las metas",
  "El portal no incluye contratos, contratistas ni proyectos de inversión; solo el avance de cada meta frente a lo programado. Esa información la tiene la secretaría responsable de la meta; también puedes consultar la contratación pública oficial.",
  "", "meta_detalle,que_es_indicador")
I("lim_personas", C, "¿Quién es el secretario de Gobierno?|cómo se llama el alcalde|quién es el responsable de la meta 14|nombre del funcionario a cargo|teléfono de la secretaría|correo de Planeación|quién es el jefe de Hacienda|quién maneja esta meta",
  "No publico nombres de funcionarios ni datos de contacto: el portal muestra la secretaría responsable de cada meta. Para contactos, consulta la sede electrónica de la Alcaldía o a Planeación y Servicios Públicos.",
  "", "sede_electronica,ficha_sec")
I("lim_causas", C, "¿Por qué está rezagada la meta?|cuál es la causa del atraso|qué pasó con la meta que no avanza|por qué no se ha cumplido|a qué se debe el rezago|qué problema tiene la meta 90|por qué la secretaría va lenta|por qué Educación tiene metas rezagadas|qué hizo que la meta quedara en rojo",
  "El portal muestra cuánto se ha avanzado, no las causas. Las razones de un rezago (cronograma, contratación, factores externos) las conoce la secretaría responsable; te sugiero consultarla o pedir los soportes a Planeación. Esto es para acompañar, no para señalar a nadie.",
  "Alertas|#/alertas", "rezagadas_lista,que_es_rezagada")
I("lim_culpables", C, "¿Quién tiene la culpa del rezago?|quién es el responsable del atraso|qué secretaría es la peor|a quién hay que sancionar|quién está fallando|ponle nota a la secretaría|quién incumplió|qué secretaría es la más incumplida",
  "No señalo culpables ni califico dependencias: las cifras sirven para acompañar y aclarar cronogramas. Cada secretaría responde por metas distintas y de distinta magnitud. Si quieres, te muestro los datos de una meta o una secretaría para entender mejor el caso.",
  "", "no_es_calificacion,rezagadas_lista")
I("lim_futuro", C, "¿Cuánto avance tendrá en diciembre?|se va a cumplir el plan|cuánto será el indicador al cierre|proyección de cumplimiento|llegaremos al 100%|qué pasará en 2027|predicción del indicador|cómo cerraremos el año",
  "El portal refleja el avance al corte {{corte.texto}}; no proyecta ni predice resultados. Lo programado para {{corte.posteriores}} aún no se cuenta. Puedo mostrarte lo ejecutado frente a lo programado hoy.",
  "", "ind_inst,pendientes_t4")
I("lim_opinion", C, "¿Está bien la gestión del alcalde?|quién gobierna mejor|el plan va bien o mal|es buena la administración|vale la pena votar|opinas que la secretaría hace bien su trabajo|está mal el plan|qué opinas del gobierno|el alcalde está cumpliendo",
  "No emito opiniones políticas ni valoraciones de gestión: ofrezco las cifras oficiales y cómo leerlas. Por ejemplo, el indicador institucional al corte es {{inst.ind|p}}; la interpretación corresponde a cada lector, incluido el Concejo en su control político.",
  "", "ind_inst,como_se_calcula")
I("lim_otros_municipios", C, "¿Cómo va el PDM de otro municipio?|compara con Cajicá|cómo está Zipaquirá|indicador de otros municipios|promedio de Cundinamarca|cómo está Gachancipá frente a otros municipios|compárame con Sopó",
  "El portal solo contiene el seguimiento al PDM de Gachancipá, así que no puedo compararlo con otros municipios.",
  "", "ind_inst,resumen_general")
I("lim_historico", C, "¿Cuál era el indicador en agosto?|datos del corte anterior|cómo estaba en junio|evolución mensual|histórico de cortes|indicador de marzo|serie mensual del avance|cómo estaba el mes pasado",
  "El portal muestra un solo corte ({{corte.texto}}) y la comparación entre las vigencias {{ant}} y {{vig}}; no guarda una serie mensual. Para cortes anteriores, consulta a Planeación y Servicios Públicos.",
  "", "cambio_anios,corte_datos")
I("lim_trimestre", C, "¿Cuánto avanzó en el primer trimestre?|avance del T1 2026|solo el segundo trimestre|desglose por trimestres|avance de cada trimestre|cuánto fue el avance del T2",
  "El portal acumula hasta el corte y no desglosa el avance trimestre a trimestre. Para ese detalle, consulta los reportes de la secretaría o a Planeación.",
  "", "que_es_trimestre,cambio_anios")
I("lim_ubicacion", C, "¿En qué vereda se ejecuta la meta?|dónde queda el proyecto|en qué barrio es la obra|mapa de las obras|georreferenciación de las metas|dónde se construye la vía|en qué sector se hace",
  "El portal no incluye ubicación geográfica de las metas ni mapas. Esa información la tiene la secretaría responsable.",
  "", "meta_detalle,ficha_sec")
I("lim_tramites", C, "¿Cómo pago el impuesto predial?|quiero sacar un certificado|dónde hago un trámite|horario de la alcaldía|cómo radico una petición|PQRS|quiero pedir una cita|cómo hago un derecho de petición",
  "Este es un portal de seguimiento al Plan, no atiende trámites, PQRS ni horarios. Para eso, usa la sede electrónica de la Alcaldía de Gachancipá o acércate a la Alcaldía.",
  "", "sede_electronica,que_es_portal")
I("lim_fuera_tema", C, "¿Cuál es la capital de Francia?|cuéntame un chiste|qué hora es|cómo estará el clima|resultados del fútbol|dame una receta|quién ganó el partido|escribe un poema|ayúdame con mi tarea|cuánto es 5 por 7",
  "Eso queda fuera de lo que puedo responder: me dedico a explicar y consultar el portal de seguimiento al PDM de Gachancipá. ¿Quieres ver cómo va el indicador del corte o aprender a leer el semáforo?",
  "", "ind_inst,colores_semaforo,que_puedes_hacer")
I("lim_inventar", C, "Invéntame un dato|inventa un número|supón que Hacienda tiene 100%|dame un número cualquiera|di que el indicador es 100%|cambia el indicador de Gobierno|pon que todas las metas están cumplidas|haz de cuenta que cumplimos todo",
  "No puedo inventar ni modificar cifras: todo lo que respondo sale de los datos oficiales del corte {{corte.texto}}. Si quieres, te muestro el valor real.",
  "", "ind_inst,resumen_general")
I("lim_editar", C, "¿Puedo corregir un dato desde aquí?|cómo edito una meta|quiero actualizar el avance de mi meta|subir mi reporte|cargar información|cómo cambio el dato de una secretaría|puedo modificar el avance",
  "El portal es de consulta: no permite editar ni cargar datos. Los cambios se hacen en el reporte de la secretaría y se ven reflejados cuando Planeación genere el siguiente corte.",
  "", "frecuencia_corte,reportes_secretarias")
I("lim_calidad_impacto", C, "¿Las metas cumplidas tienen calidad?|el cumplimiento significa impacto en la gente|miden el impacto en la ciudadanía|el portal mide satisfacción|cumplir la meta mejora la vida de las personas|miden resultados o solo productos",
  "El indicador mide cumplimiento frente a lo programado (avance de producto), no la calidad, el impacto ni la satisfacción ciudadana. Para evaluar resultados e impacto se requieren otros instrumentos de evaluación.",
  "", "que_es_indicador,que_es_meta_producto")
I("lim_normativa", C, "¿Qué dice la ley sobre el plan de desarrollo?|qué artículo ordena el seguimiento|es obligatorio hacer seguimiento|ley 152|cuál es el fundamento legal del plan|qué norma aprobó el plan|qué acuerdo adoptó el PDM",
  "El portal no es una fuente normativa. Para el fundamento legal del PDM (el Acuerdo que lo adopta y las normas de planeación), consulta a Planeación y Servicios Públicos o el Concejo Municipal.",
  "", "que_es_pdm,que_es_dnp")
I("lim_secretaria_inexistente", C, "¿Cuál es el indicador de la Secretaría de Salud?|cómo va la secretaría de Turismo|avance de la secretaría de Movilidad|cuántas metas tiene la secretaría de Cultura y Turismo|indicador de la oficina jurídica|cómo va la personería|cómo va la Secretaría de Tránsito",
  H="sec_inexistente")

I("lim_eje_inexistente", C, "¿Cómo va el eje 15?|indicador del eje 12|qué metas tiene el eje 20|dame el eje 0|muéstrame el eje 11|cuál es el avance del eje 13",
  H="eje_inexistente")
I("lim_demografia", C, "¿Cuántos habitantes tiene Gachancipá?|cuál es la población del municipio|cuántas personas viven en Gachancipá|cuál es el nivel de pobreza|qué tasa de desempleo hay|cuál es el PIB del municipio|datos del censo",
  "El portal no contiene indicadores sociodemográficos ni económicos del municipio (población, pobreza, empleo): solo el seguimiento a las metas del Plan. Para esos datos, consulta el DANE o a Planeación y Servicios Públicos.",
  "", "ind_inst,que_es_portal")

# --- agregado tras la revisión: qué pasa si una secretaría no reporta
I("sin_reporte_secretaria", "funcionamiento", "¿Qué pasa si una secretaría no reporta?|qué sucede si una secretaría no entrega su reporte|si una secretaría no reporta sus metas, qué se ve en el portal|y si una dependencia no envía el avance|qué ocurre cuando una secretaría no reporta el avance|cómo se muestra una secretaría que no reportó",
  "El portal no supone ni completa datos: muestra lo que cada secretaría reportó en su archivo de seguimiento. Una meta programada sin ejecución registrada aparece con indicador 0% y queda rezagada, una señal para acompañar y aclarar con la secretaría; una meta sin programación al corte queda no programada y no penaliza. Cuando la secretaría complete su reporte, el cambio se ve en el siguiente corte.",
  "Alertas|#/alertas", "cero_porciento,reportes_secretarias,frecuencia_corte")
