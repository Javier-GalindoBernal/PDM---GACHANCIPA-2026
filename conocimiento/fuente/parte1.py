# -*- coding: utf-8 -*-
from base import I

# ====================================================== CONVERSACIÓN
C = "conversacion"
I("saludo", C, "¡Hola!|hola|buenos días|buenas tardes|buenas noches|buenas|hola nemequi|saludos|buen día|hey hola|qué más",
  "¡Hola! Soy NEMEQUI, la guía virtual del portal de seguimiento al PDM de Gachancipá. Puedo explicarte cómo leer el tablero, responder con las cifras del corte {{corte.texto}} y llevarte a la página que necesites. ¿Por dónde empezamos?",
  S="que_puedes_hacer,resumen_general,que_es_portal")
I("como_estas", C, "¿Cómo estás?|cómo te va|cómo amaneciste|qué tal estás|todo bien contigo|cómo vas hoy|cómo te encuentras",
  "¡Muy bien, gracias por preguntar! Lista para ayudarte con el tablero. ¿Qué te gustaría saber?",
  S="que_puedes_hacer,ind_inst")
I("gracias", C, "Gracias|muchas gracias|mil gracias|te lo agradezco|gracias nemequi|súper, gracias|vale, gracias|genial, gracias|perfecto, gracias|te agradezco la ayuda",
  "¡Con gusto! Si quedó alguna duda sobre el tablero, aquí sigo.",
  S="que_puedes_hacer,glosario")
I("despedida", C, "Adiós|chao|hasta luego|nos vemos|hasta pronto|me despido|bye|hasta mañana|que estés bien|ya me voy",
  "¡Hasta pronto! Cuando quieras volver a consultar el avance del Plan, aquí estaré.",
  S="resumen_general")
I("quien_eres", C, "¿Quién eres?|cómo te llamas|cuál es tu nombre|qué eres|preséntate|tú quién eres|eres un robot|eres una persona",
  "Soy NEMEQUI, la guía virtual del portal de seguimiento al PDM de Gachancipá. No soy una persona: soy un asistente que responde con los datos oficiales del corte {{corte.texto}} y te ayuda a entender y usar el tablero.",
  S="que_puedes_hacer,como_funciona_nemequi")
I("que_significa_nemequi", C, "¿Por qué te llamas NEMEQUI?|qué significa nemequi|de dónde viene tu nombre|por qué eres una niña muisca|quién es la niña del video|qué es nemequi|por qué te ves así",
  "NEMEQUI es el nombre de la guía virtual del portal. Me representan como una niña muisca, un guiño a la herencia ancestral del territorio de Gachancipá, para acompañarte con cercanía a entender el tablero.",
  S="que_puedes_hacer,que_es_portal")
I("que_puedes_hacer", C, "¿Qué puedes hacer?|ayuda|en qué me puedes ayudar|para qué sirves|qué sabes hacer|qué funciones tienes|qué me puedes responder|cómo me ayudas",
  "Puedo: (1) explicarte qué significa cada concepto del tablero, como el indicador, el semáforo o el corte; (2) enseñarte cómo usar cada página; (3) responder con cifras del corte {{corte.texto}}, por secretaría, eje o meta; y (4) llevarte a la página adecuada. Lo que el portal no contiene, como presupuesto o causas de un rezago, te lo diré con claridad.",
  S="resumen_general,colores_semaforo,como_se_calcula")
I("como_funciona_nemequi", C, "¿Cómo funcionas?|cómo funciona el motor de preguntas|usas inteligencia artificial|te conectas a internet|tus respuestas vienen de internet|tus respuestas son confiables|inventas las cifras|respondes con datos reales",
  "Funciono con un motor propio que corre en tu navegador, sin conectarse a servidores externos. Las cifras no están escritas a mano: las calculo en el momento desde los datos oficiales del corte {{corte.texto}}. Si algo no está en el portal, te lo digo en lugar de inventarlo.",
  S="no_recalcula,fuentes_datos")
I("repetir_simple", C, "No entendí|puedes explicarlo más fácil|explícame más sencillo|dilo de otra forma|repite por favor|no comprendo|me perdí|en palabras simples|más simple por favor",
  "Con gusto lo aclaro. Dime qué parte no quedó clara (por ejemplo «indicador», «semáforo» o «corte») y te la explico en palabras sencillas, o elige una de estas opciones.",
  S="que_es_indicador,colores_semaforo,que_es_corte")
I("afirmar", C, "Sí|sí por favor|ok|dale|listo|claro|de acuerdo|vale|está bien|adelante|continúa",
  "¡Perfecto! ¿Qué te gustaría ver ahora? Puedo mostrarte el resumen del corte, las metas rezagadas o explicarte cómo se lee el semáforo.",
  S="resumen_general,rezagadas_lista,colores_semaforo")
I("negar", C, "No|no gracias|no por ahora|eso es todo|eso sería todo|no necesito nada más por ahora|nada más|ya no",
  "Entendido. Aquí sigo por si surge otra duda sobre el tablero.",
  S="que_puedes_hacer")
I("elogio", C, "Excelente|qué bien|muy bien|me gusta|eres genial|buen trabajo|qué útil|bravo|felicitaciones|estupendo|me encantó",
  "¡Muchas gracias! Me alegra que te sea útil. Si quieres profundizar, te dejo algunas ideas.",
  S="resumen_general,como_leer_graficos")
I("queja", C, "No me sirves|esto no funciona|no entiendes nada|qué mal|respuesta mala|eso no responde mi pregunta|no es lo que pregunté|estás equivocada|no me ayudaste",
  "Lamento no haber acertado. Cuéntame de otra forma lo que buscas (por ejemplo, «metas rezagadas de Gobierno») o elige una de las preguntas sugeridas. Si el dato no está en el portal, también te lo diré con claridad.",
  S="que_puedes_hacer,ejemplos_preguntas")
I("perdon", C, "Perdón|disculpa|lo siento|perdona la molestia|disculpa la insistencia|perdona",
  "No hay problema, pregunta con toda confianza. ¿En qué te ayudo?",
  S="que_puedes_hacer")
I("risa", C, "Jaja|jeje|jajaja|lol|xd|ja ja|qué chistoso",
  "¡Me alegra! Cuando quieras, seguimos con el tablero.",
  S="resumen_general")
I("ejemplos_preguntas", C, "Dame ejemplos de preguntas|qué puedo preguntarte|ejemplos|sugiéreme una pregunta|no sé qué preguntar|por dónde empiezo|qué pregunto|dame ideas de preguntas|dame preguntas de ejemplo",
  "Aquí van algunas ideas. Puedes preguntarme por conceptos («¿qué es una meta no programada?»), por cifras («¿cuántas metas están rezagadas?») o por navegación («llévame al explorador de metas»).",
  S="resumen_general,colores_semaforo,rezagadas_lista")

# ====================================================== COMPRENDER
C = "comprender"
I("que_es_portal", C, "¿Qué es este portal?|qué es este tablero|de qué trata este portal|qué es el portal de seguimiento|explícame el dashboard|qué es esto|de qué se trata el tablero|para qué es esta página|qué es el dashboard del pdm",
  "Es el portal de seguimiento al Plan de Desarrollo Municipal (PDM) de Gachancipá. Reúne, con corte al {{corte.texto}}, el avance de {{n.registros}} filas de meta ({{n.unicas}} metas únicas) reportadas por {{n.sec}} secretarías y organizadas en {{n.ejes}} ejes estratégicos. Sirve para ver el panorama, encontrar metas y consultar los informes.",
  "Resumen ejecutivo|#/resumen", "para_que_sirve,menu_como,resumen_general")
I("para_que_sirve", C, "¿Para qué sirve el portal?|cuál es el objetivo del tablero|qué puedo hacer aquí|qué utilidad tiene|para qué me sirve este dashboard|qué beneficios tiene|con qué fin se hizo|cuál es el propósito del portal",
  "Sirve para conocer cómo avanza el Plan: ver el indicador general, comparar secretarías y ejes, encontrar metas puntuales, identificar las que conviene acompañar y descargar los informes. Es una herramienta de lectura y orientación, no de calificación de personas ni dependencias.",
  "", "a_quien_dirigido,menu_como,no_es_calificacion")
I("a_quien_dirigido", C, "¿A quién va dirigido el portal?|quién usa este tablero|esto es para el Concejo|es para la ciudadanía|para quién es esta información|quién puede entrar a este portal|quién puede consultar el tablero|es de uso público",
  "Está pensado para el seguimiento institucional: la administración, las secretarías, el Concejo Municipal en su control político y la ciudadanía interesada. Por eso el lenguaje busca ser claro y las cifras son las oficiales del corte.",
  "", "para_que_sirve,no_es_calificacion")
I("que_es_pdm", C, "¿Qué es el PDM?|qué es el plan de desarrollo municipal|qué significa PDM|para qué sirve el plan de desarrollo|qué es un plan de desarrollo|qué es el plan de desarrollo de Gachancipá|de qué trata el PDM",
  "El PDM (Plan de Desarrollo Municipal) es la hoja de ruta de la administración para su período de gobierno: define ejes estratégicos y metas que cada secretaría se compromete a lograr. Este portal sigue {{n.registros}} filas de meta ({{n.unicas}} metas únicas) en {{n.ejes}} ejes.",
  "", "que_es_eje,que_es_meta_producto,lista_ejes")
I("que_es_indicador", C, "¿Qué mide el indicador?|qué es el indicador de avance|qué significa el indicador|qué representa el porcentaje|qué muestra el número grande del resumen|qué es el indicador|qué quiere decir indicador de avance|el indicador qué significa",
  "El indicador de avance compara lo ejecutado con lo programado hasta el corte: indica qué porcentaje de lo previsto se ha cumplido. Un 100% significa que se ejecutó lo que estaba programado a la fecha.",
  "Metodología|#/metodologia", "como_se_calcula,colores_semaforo,ind_inst")
I("como_se_calcula", C, "¿Cómo se calcula el indicador?|cuál es la fórmula del indicador|cómo se saca el porcentaje de una meta|de dónde sale el porcentaje de avance|cómo calculan el avance|fórmula del avance|cómo se mide el avance de una meta|cómo se obtiene el indicador de una meta",
  "Para cada meta: indicador = ejecutado acumulado ÷ programado acumulado × 100, sumando la vigencia {{ant}} completa y la vigencia {{vig}} hasta el corte. Por ejemplo, la meta {{ej.cod}} ({{ej.sec}}): {{ej.ea|n}} ÷ {{ej.pa|n}} = {{ej.ind|p}}.",
  "Metodología|#/metodologia", "calculo_secretaria_eje,calculo_institucional,ejemplo_calculo")
I("ejemplo_calculo", C, "Dame un ejemplo del cálculo|ejemplo de cómo se calcula una meta|muéstrame un cálculo paso a paso|un caso práctico del indicador|cómo se calculó la meta de ejemplo|ejemplifica la fórmula",
  "Tomemos la meta {{ej.cod}} ({{ej.sec}}). Programado acumulado: {{ej.pa|n}}; ejecutado acumulado: {{ej.ea|n}}. Indicador = {{ej.ea|n}} ÷ {{ej.pa|n}} × 100 = {{ej.ind|p}}.",
  "Ver la meta|#/meta/{{ej.car}}/{{ej.cod}}", "como_se_calcula,colores_semaforo")
I("calculo_secretaria_eje", C, "¿Cómo se calcula el indicador de una secretaría?|cómo se calcula el indicador de un eje|cómo se saca el promedio de la secretaría|el indicador de la secretaría es un promedio|cómo se agrupan las metas|se promedian las metas|cómo se calcula el indicador por eje",
  "El indicador de una secretaría o de un eje es la media simple de los indicadores de sus metas programadas al corte. Las metas no programadas no entran en ese promedio.",
  "", "calculo_institucional,por_que_no_penaliza")
I("calculo_institucional", C, "¿Cómo se calcula el indicador institucional?|cómo se calcula el indicador general|el indicador institucional es un promedio de qué|qué es el indicador de la alcaldía|de dónde sale el indicador institucional|por qué pesan igual las secretarías|cómo se saca el indicador global|el indicador institucional pondera por metas",
  "El indicador institucional ({{inst.ind|p}} al corte) es la media simple de los indicadores de las {{n.sec}} secretarías: cada una pesa igual, sin importar cuántas metas tenga. Por eso las secretarías con pocas metas programadas influyen tanto como las que tienen muchas.",
  "", "eje_vs_institucional,media_simple,ind_inst")
I("colores_semaforo", C, "¿Qué significan los colores?|qué significa el semáforo|qué quiere decir el rojo|qué es el verde|qué significa el amarillo|qué color es cada estado|explícame el semáforo|qué significa el color gris|cómo se leen los colores|qué es el semáforo de metas",
  "El semáforo clasifica cada meta según su indicador: verde, cumplida (100% o más); ámbar, en avance (de 20% a 99%); rojo, rezagada (menos de 20%, con programación al corte); gris, no programada (sin programación al corte). Los colores siempre van con el nombre del estado.",
  "Metodología|#/metodologia", "umbrales,por_que_no_penaliza,conteo_estados")
I("umbrales", C, "¿Cuáles son los umbrales del semáforo?|a partir de cuánto es rezagada|desde cuándo una meta está cumplida|qué porcentaje es en avance|rangos del semáforo|con cuánto una meta es roja|cuánto hay que tener para estar cumplida|límites de cada estado|reglas del semáforo",
  "Estados oficiales: cumplida, indicador de 100% o más; en avance, de 20% a 99%; rezagada, menos de 20% (solo si la meta tiene programación al corte); no programada, sin programación al corte, que no entra en el promedio.",
  "Metodología|#/metodologia", "colores_semaforo,que_es_rezagada")
I("que_es_cumplida", C, "¿Qué es una meta cumplida?|qué significa cumplida|cuándo una meta se considera cumplida|meta cumplida qué quiere decir|qué es estar en verde|qué es una meta al 100",
  "Una meta cumplida tiene un indicador de 100%: lo ejecutado alcanzó o superó lo programado al corte (el indicador de una meta se topa en 100%). Hoy hay {{inst.cumplida}} metas en ese estado.",
  "Logros y metas cumplidas|#/logros", "cumplida_vs_certificable,mayor_100")
I("que_es_en_avance", C, "¿Qué es una meta en avance?|qué significa en avance|cuándo una meta está en avance|meta en avance qué quiere decir|qué es estar en ámbar|qué es una meta amarilla",
  "Una meta en avance tiene programación al corte y un indicador entre 20% y 99%: va ejecutándose, aunque aún no alcanza lo programado. Hoy hay {{inst.en_avance}} metas en ese estado.",
  "Alertas|#/alertas", "que_es_rezagada,umbrales")
I("que_es_rezagada", C, "¿Qué es una meta rezagada?|qué significa rezagada|cuándo una meta está rezagada|meta rezagada qué quiere decir|qué es estar en rojo|qué es una meta atrasada|qué es una meta crítica",
  "Una meta rezagada tiene programación al corte, pero un indicador menor al 20%. No es un juicio sobre la secretaría: es una señal para acompañar y revisar cronograma y soportes. Hoy hay {{inst.rezagada}} metas en ese estado.",
  "Alertas|#/alertas", "rezagadas_lista,lim_causas")
I("que_es_no_programada", C, "¿Qué es una meta no programada?|qué significa no programada|meta sin programación qué es|qué quiere decir no programada al corte|qué significa que una meta no esté programada|cuándo una meta es no programada|meta no planeada qué significa|qué es estar en gris",
  "Una meta no programada no tiene programación acumulada hasta el corte (ni en {{ant}} ni en {{vig}} hasta {{corte.trimestre}}). No indica incumplimiento y no entra en el promedio. Hoy hay {{inst.no_programada}} metas así.",
  "Alertas|#/alertas", "por_que_no_penaliza,no_programadas_lista")
I("por_que_no_penaliza", C, "¿Por qué las metas no programadas no penalizan?|por qué no cuentan las no programadas|una meta no programada es incumplimiento|las no programadas bajan el indicador|por qué no entran en el promedio|por qué no se castiga una meta sin programación|cómo afectan las no programadas",
  "Porque no tenían nada previsto para ejecutar hasta el corte: no hay un compromiso vencido que medir. Por eso no entran en el promedio y no indican incumplimiento; su programación, si la hay, corresponde a otras vigencias.",
  "", "que_es_no_programada,calculo_secretaria_eje")
I("que_es_corte", C, "¿Qué es el corte?|qué significa corte|qué es la fecha de corte|qué significa al corte|por qué dicen al corte|a qué se refiere el corte|qué quiere decir corte de información",
  "El corte es la fecha hasta la cual se acumula la información: {{corte.texto}} ({{corte.trimestre}} de {{vig}}). Todo lo que ves está medido hasta ese día; el corte se actualiza cada mes.",
  "", "vigencias,actualizacion,corte_datos")
I("vigencias", C, "¿Qué son las vigencias 2025 y 2026?|qué significa vigencia|qué es la vigencia|por qué hay dos vigencias|qué diferencia hay entre 2025 y 2026|qué es el avance 2025|qué es el avance 2026 al corte|por qué se comparan dos años",
  "Vigencia es el año de ejecución del Plan. El portal compara {{ant}} (vigencia cerrada, tomada del {{fuente.anterior}}) y {{vig}} (acumulada desde enero hasta el corte). Cada avance se mide frente a lo programado en su período, y el indicador suma ambos.",
  "", "avance_vs_indicador,que_es_corte")
I("avance_vs_indicador", C, "¿Qué diferencia hay entre avance e indicador?|avance 2025, avance 2026 e indicador: qué son|por qué hay tres porcentajes|qué diferencia hay entre indicador y avance|cuál porcentaje define el semáforo|qué es cada porcentaje de una meta",
  "Avance {{ant}}: lo ejecutado frente a lo programado en ese año. Avance {{vig}} al corte: lo mismo, de enero al corte. Indicador: lo ejecutado frente a lo programado en ambos períodos acumulados; es el valor que define el semáforo.",
  "", "vigencias,como_se_calcula")
I("meta_compartida", C, "¿Qué es una meta compartida?|qué significa meta compartida|por qué hay metas en varias secretarías|dos secretarías reportan la misma meta|por qué una meta aparece en dos secretarías|qué pasa si una meta es de dos secretarías|metas compartidas qué son|quién responde por una meta compartida",
  "Es una meta que figura en más de una secretaría: cada una reporta su parte. Por eso aparece una vez por secretaría ({{n.registros}} filas para {{n.unicas}} metas únicas). Hoy hay {{n.compartidas}} metas compartidas.",
  "Metas compartidas|#/compartidas", "registros_vs_unicas,compartidas_datos")
I("registros_vs_unicas", C, "¿Por qué hay más filas que metas únicas?|hay metas duplicadas|se cuentan dos veces las compartidas|diferencia entre registro y meta única|por qué se repiten algunas metas|por qué el total de metas no coincide con las únicas|qué es un registro de meta",
  "Cada fila es una meta reportada por una secretaría. Las metas compartidas aparecen una vez por secretaría, por eso hay {{n.registros}} filas pero {{n.unicas}} metas únicas por código. No son errores: es la forma de respetar el reporte de cada dependencia.",
  "Metas compartidas|#/compartidas", "meta_compartida,total_metas")
I("arrastre", C, "¿Qué es el arrastre de 2025?|qué significa arrastre|qué es una meta de arrastre|qué significa sin programación 2026 al corte|por qué hay metas que dicen sin programación 2026 al corte|metas con arrastre qué son|qué es la marca de arrastre|por qué dice arrastre 2025",
  "Arrastre de {{ant}} marca metas que no tienen programación {{vig}} al corte. Algunas ya se cumplieron con lo registrado en {{ant}}; otras conservan el avance de ese año o registran ejecución sin programación. Hoy hay {{n.arrastre}} metas marcadas; la marca busca que su lectura sea transparente.",
  "Metas compartidas y calidad de dato|#/compartidas", "arrastre_datos,etiquetas_metas")
I("pnp", C, "¿Qué es P/NP?|qué significa P y NP|qué quiere decir pnp|p np qué es|qué es una meta P|qué es una meta NP|siglas P y NP|qué son metas planeadas y no planeadas",
  "P/NP distingue las metas programadas (P) de las no programadas (NP) al corte; en reportes internos también se dice planeadas y no planeadas. Las NP no entran en el promedio ni penalizan. Hoy hay {{inst.programadas}} programadas y {{inst.no_programada}} no programadas.",
  "", "que_es_no_programada,por_que_no_penaliza")
I("meta_certificable", C, "¿Qué es una meta certificable?|qué significa certificable|cuándo se certifica una meta|metas certificables cómo se definen|qué es certificar una meta|qué quiere decir meta certificada",
  "Certificable es una meta que cumplió lo programado y no tiene programación en {{corte.posteriores}}: ya no queda nada por ejecutar frente a lo programado en {{ant}}-{{vig}}. Hoy hay {{n.cert}} certificables.",
  "Logros y metas cumplidas|#/logros", "t4_pendiente,cumplida_vs_certificable,certificables_datos")
I("t4_pendiente", C, "¿Qué es una meta con T4 pendiente?|qué significa con programación posterior|meta al 100 con programación posterior|por qué una meta cumplida no está certificada|cuándo se certifican las que tienen programación pendiente|qué es meta pendiente de certificar|metas cumplidas con T4|qué quiere decir cumplida con programación en el cuarto trimestre",
  "Son metas que van al 100% al corte, pero todavía tienen programación en {{corte.posteriores}}: se certifican cuando concluya ese período. Hoy son {{n.pend}} metas únicas ({{n.pend_reg}} filas).",
  "Logros y metas cumplidas|#/logros", "meta_certificable,pendientes_t4")
I("cumplida_vs_certificable", C, "¿Cuál es la diferencia entre cumplida y certificable?|una meta cumplida es certificable|por qué no todas las cumplidas son certificables|cumplida versus certificable|qué distingue una meta cumplida de una certificable",
  "Cumplida es un estado al corte (indicador de 100%). Certificable es una cumplida sin programación posterior. Hoy hay {{inst.cumplida}} cumplidas, de las cuales {{n.cert}} son certificables y el resto aún tiene programación en {{corte.posteriores}}.",
  "Logros y metas cumplidas|#/logros", "meta_certificable,t4_pendiente")
I("mayor_100", C, "¿Por qué hay valores mayores a 100%?|qué significa un indicador de 200|ejecución superior a lo programado|por qué una meta tiene más de 100|es un error pasar del 100|sobreejecución qué es|puede una meta pasar de 100 por ciento",
  "Ninguna meta muestra más de 100%: el indicador de cada meta se topa en 100%, porque una meta cumplida está cumplida aunque se haya ejecutado más de lo programado. Hay {{n.sobre}} metas con ejecución superior a lo programado (o ejecución sin programación); se muestran como 100%, cuentan como cumplidas.",
  "Metas compartidas y calidad de dato|#/compartidas", "sobreejecucion_datos,que_es_cumplida")
I("regla_2025_cumplida", C, "¿Por qué el 2025 de una meta aparece en 100%?|por qué una meta tiene 2025 al 100 si no lo ejecutó|qué es el ajuste de 2025|qué pasa con 2025 si la meta se cumple en 2026|regla de cumplimiento 2026|por qué se cambia el 2025 cuando se cumple en 2026|cómo se trata 2025 cuando la meta está cumplida",
  "Cuando una meta alcanza el 100% en 2026, su 2025 también se cuenta como 100%: se entiende que la meta quedó cumplida y el rezago de 2025 se cerró. Es una regla definida por la administración; el valor original del Plan Indicativo se conserva como dato informativo.",
  "Metas compartidas y calidad de dato|#/compartidas", "mayor_100,que_es_cumplida")
I("ambas_distinto", C, "¿Por qué «Ambas» da un valor distinto al promedio?|qué significa Ambas|ambas 2025 2026 qué es|por qué el indicador no es el promedio de 2025 y 2026|el indicador no es el promedio de las dos vigencias|por qué no coincide con el promedio de los dos años|qué significa ambas en el tablero",
  "Con «Ambas» (2025–2026) al corte, el indicador se calcula sobre la suma de las dos vigencias en cada meta, no promediando los dos porcentajes. Por eso puede diferir del promedio simple de {{inst.a2025|p}} y {{inst.a2026|p}}. Esta opción aparece en el tablero de control de una sola página.",
  "Tablero de una sola página|tablero.html", "avance_vs_indicador,tablero_una_pagina")
I("que_es_meta_producto", C, "¿Qué es una meta de producto?|qué es meta de producto DNP|qué es un producto en el plan|meta de producto significado|qué significa meta|qué es una meta en el plan",
  "En la terminología del DNP, una meta de producto es la cantidad de bienes o servicios que la administración se compromete a entregar en una vigencia. En el portal cada meta tiene un código, una secretaría responsable, un eje y valores programados y ejecutados.",
  "", "que_es_programado,que_es_ejecutado")
I("que_es_programado", C, "¿Qué significa programado?|qué es lo programado|qué es programado acumulado|qué es la programación|qué quiere decir prog|qué se programa en una meta",
  "Programado es la cantidad prevista para un período en el plan indicativo. El programado acumulado suma lo previsto en {{ant}} y en {{vig}} hasta el corte.",
  "", "que_es_ejecutado,acumulado")
I("que_es_ejecutado", C, "¿Qué significa ejecutado?|qué es lo ejecutado|qué es ejecutado acumulado|qué es la ejecución|quién reporta lo ejecutado|qué quiere decir ejec",
  "Ejecutado es la cantidad que la secretaría reporta como lograda. El ejecutado acumulado suma lo logrado en {{ant}} y en {{vig}} hasta el corte; se compara con el programado acumulado.",
  "", "que_es_programado,como_se_calcula")
I("acumulado", C, "¿Qué significa acumulado?|por qué se acumula|qué es acumulado al corte|acumulado hasta el corte qué significa|por qué se suman las dos vigencias|qué se acumula en el indicador",
  "Acumulado es la suma de lo previsto (o lo logrado) desde {{ant}} hasta el corte de {{vig}}. Se acumula para medir el cumplimiento total frente a lo que debía estar hecho a la fecha, no solo el del último período.",
  "", "como_se_calcula,que_es_corte")
I("que_es_eje", C, "¿Qué es un eje estratégico?|qué significa eje|qué son los ejes del plan|para qué sirven los ejes|qué es un eje del PDM|cómo se organiza el plan en ejes",
  "Un eje estratégico agrupa metas por tema. El Plan tiene {{n.ejes}} ejes y cada meta pertenece a uno; en el portal puedes ver el indicador, el semáforo y las secretarías de cada eje.",
  "Avance por eje|#/ejes", "lista_ejes,como_se_asigna_eje")
I("como_se_asigna_eje", C, "¿Cómo se asigna una meta a un eje?|a qué eje pertenece una meta|una secretaría puede estar en varios ejes|por qué una secretaría aparece en varios ejes|las secretarías tienen un solo eje|cómo se reparten las metas por eje",
  "Cada meta pertenece a un eje según el Plan. Como una secretaría tiene metas de distintos temas, puede aparecer en varios ejes; por ejemplo, {{sec_eje_max.corto}} participa en {{sec_eje_max.n}} ejes.",
  "", "ejes_de_sec,que_es_eje")
I("que_es_trimestre", C, "¿Qué es T3?|qué significan T1 T2 T3 T4|qué es el trimestre del corte|a qué trimestre corresponde el corte|qué es el cuarto trimestre|qué es T4|qué significa trimestre",
  "T1 a T4 son los trimestres del año. El corte actual es {{corte.trimestre}} ({{corte.texto}}); lo programado para {{corte.posteriores}} aún no se cuenta en el indicador.",
  "", "que_es_corte,t4_pendiente")
I("que_es_dnp", C, "¿Qué es el DNP?|quién es el DNP|qué significa DNP|metodología DNP qué es|por qué usan la metodología del DNP|qué es el Departamento Nacional de Planeación|por qué se sigue al DNP",
  "El DNP es el Departamento Nacional de Planeación, entidad del orden nacional que orienta la planeación territorial. El portal sigue su metodología de seguimiento: compara ejecutado y programado acumulados al corte.",
  "Metodología|#/metodologia", "como_se_calcula,metodologia_dnp")
I("plan_indicativo", C, "¿Qué es el Plan Indicativo?|plan indicativo qué significa|de dónde sale el avance 2025|qué es el plan indicativo seg PDM|por qué se usa el plan indicativo|qué contiene el plan indicativo",
  "El Plan Indicativo programa, año a año, lo que cada meta debe lograr. El portal toma de allí el avance de {{ant}} (fuente: {{fuente.anterior}}), enlazado por código de meta.",
  "Metodología|#/metodologia", "vigencias,fuentes_datos")
I("eje_vs_institucional", C, "¿Por qué un eje puede tener un indicador mayor al institucional?|por qué el indicador de los ejes no coincide con el institucional|por qué el eje da distinto|por qué el institucional es menor que el de los ejes|diferencia entre indicador de eje e institucional|por qué no cuadran ejes e institucional",
  "El indicador de un eje promedia sus metas; el institucional promedia las secretarías. Como cada secretaría pesa igual sin importar su número de metas, las que tienen pocas metas programadas ({{sec_pocas}}) pesan lo mismo que las demás y pueden hacer que los dos valores difieran.",
  "", "calculo_institucional,media_simple")
I("media_simple", C, "¿Qué es la media simple?|promedio simple qué es|por qué usan media simple|por qué no ponderan|ponderado o simple|por qué no usan promedio ponderado|qué significa promedio simple de secretarías|por qué no se pondera por número de metas",
  "La media simple suma los indicadores y divide por la cantidad, sin pesos distintos. Así, cada secretaría cuenta igual en el indicador institucional y cada meta programada cuenta igual en el de su secretaría o eje.",
  "", "calculo_institucional,eje_vs_institucional")
I("no_es_calificacion", C, "¿El portal califica a las secretarías?|esto es un ranking de culpables|las cifras evalúan personas|este tablero es una evaluación|qué pasa si mi secretaría sale baja|el ranking mide quién trabaja mejor|se pueden comparar las secretarías",
  "No. El portal orienta la gestión: muestra el avance frente a lo programado para acompañar a las secretarías y aclarar cronogramas. Cada secretaría responde por metas distintas y de distinta magnitud, así que un orden por indicador no mide la calidad de su trabajo.",
  "", "para_que_sirve,lim_causas")
I("guion_en_tabla", C, "¿Por qué sale un guion en la tabla?|por qué algunas metas no tienen avance 2025|qué significa el guion|qué significa el signo — en la tabla|por qué hay guiones en los porcentajes|por qué una celda está vacía",
  "Un guion indica que no hay valor para calcular: las metas sin programación en {{ant}} (son {{n.sin2025}}) no tienen avance de ese año, y las no programadas no tienen indicador.",
  "", "que_es_no_programada,vigencias")
I("cero_porciento", C, "¿Qué significa 0% en una meta?|por qué una meta tiene cero|meta con indicador cero|0 por ciento qué quiere decir|qué es un avance de cero",
  "Un 0% en una meta con programación al corte indica que aún no se registra ejecución frente a lo programado; por eso queda rezagada. No dice por qué: eso se consulta con la secretaría.",
  "Alertas|#/alertas", "que_es_rezagada,lim_causas")
I("glosario", C, "Glosario|dame el glosario|¿dónde encuentro el glosario?|términos del portal|diccionario de términos|vocabulario DNP|definiciones de los términos|qué significan los términos del tablero",
  "Glosario breve: meta, compromiso del Plan con una cantidad a lograr; programado, lo previsto; ejecutado, lo logrado; indicador, ejecutado acumulado ÷ programado acumulado; corte, fecha hasta la que se acumula ({{corte.texto}}); vigencia, año de ejecución; eje, agrupación temática ({{n.ejes}} ejes). El glosario completo está en Metodología.",
  "Metodología y fuentes|#/metodologia", "que_es_indicador,que_es_corte,que_es_eje")
I("tablero_una_pagina", C, "¿Qué es el tablero de control de una sola página?|hay una versión resumida del tablero|tablero.html|dónde está el dashboard simple|versión de una página|hay otro tablero con filtros por vigencia",
  "Además del portal hay un tablero de control de una sola página, con filtros por vigencia, periodo y secretaría. Sus cifras son las mismas cifras oficiales del corte.",
  "Tablero de una sola página|tablero.html", "ambas_distinto,que_es_portal")
I("como_leer_graficos", C, "¿Cómo leo los gráficos?|cómo se lee el mapa de calor|qué muestran las barras|qué es el anillo del semáforo|qué es el mapa de calor|qué muestra el gráfico de barras|cómo interpreto los gráficos",
  "Anillo del semáforo: proporción de metas por estado. Barras: indicador por secretaría o por eje. Barras agrupadas: avance {{ant}} frente a {{vig}} al corte. Mapa de calor: número de metas por eje y estado. Casi todos se pueden abrir con un clic.",
  "Resumen ejecutivo|#/resumen", "clic_graficos,tabla_del_grafico")
I("etiquetas_metas", C, "¿Qué son las etiquetas junto a las metas?|qué significan los tags|qué son las marcas junto a las metas|etiquetas de arrastre y compartida|qué significa la etiqueta amarilla de una meta",
  "Junto a algunas metas aparecen etiquetas de lectura: «Meta compartida», «Sin programación 2026 al corte (arrastre 2025)» y «Ejecución superior a lo programado». No restan mérito; aclaran cómo leer el dato.",
  "Metas compartidas y calidad de dato|#/compartidas", "arrastre,meta_compartida,mayor_100")
I("que_es_vigencia_posterior", C, "¿Qué es la programación posterior al corte?|qué es programado posterior 2026|qué significa programación posterior|por qué hay programación después del corte|qué es lo programado para el cuarto trimestre|qué es la programación de T4|qué es lo que viene después del corte",
  "Es lo que está programado para {{corte.posteriores}}, después del corte. No entra en el indicador actual: se medirá cuando se actualice el corte.",
  "", "t4_pendiente,que_es_corte")
