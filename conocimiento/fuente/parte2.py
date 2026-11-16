# -*- coding: utf-8 -*-
from base import I

# ====================================================== FUNCIONAMIENTO
C = "funcionamiento"
I("menu_como", C, "¿Cómo funciona el menú?|cómo navego por el portal|dónde está el menú|qué secciones tiene el portal|cómo me muevo entre páginas|cuáles son las páginas del portal|qué páginas tiene el tablero|cómo uso el menú lateral",
  "El menú lateral tiene tres grupos: Seguimiento (Resumen ejecutivo, Avance por eje, Secretarías y Explorador de metas), Análisis (Logros, Alertas y Metas compartidas) y Documentos (Informes y Metodología). Arriba verás la ruta de navegación para volver atrás.",
  "Resumen ejecutivo|#/resumen", "pagina_resumen,menu_contraer,menu_movil")
I("pagina_resumen", C, "¿Qué hay en el resumen ejecutivo?|para qué sirve el resumen ejecutivo|qué muestra la página de inicio|qué veo en el resumen|cómo se lee la página principal|qué contiene el resumen",
  "El Resumen ejecutivo es la página de inicio: muestra el indicador del corte, el avance {{ant}} y {{vig}}, el semáforo de metas, el ranking de secretarías, el mapa de calor por eje y las metas que conviene acompañar. Casi todo es clicable para profundizar.",
  "Resumen ejecutivo|#/resumen", "resumen_kpis,clic_graficos,filtros_globales")
I("resumen_kpis", C, "¿Qué son las tarjetas del resumen?|qué significan los números grandes|qué son los indicadores clave|qué son los KPI del resumen|qué son las minigráficas de cada tarjeta|qué muestran las líneas pequeñas",
  "Las tarjetas muestran el indicador del corte, el avance {{ant}}, el avance {{vig}} al corte y el número de metas en cada estado. Las pequeñas gráficas muestran el valor por eje estratégico; al hacer clic en una tarjeta llegas a su detalle.",
  "Resumen ejecutivo|#/resumen", "como_leer_graficos,pagina_resumen")
I("pagina_ejes", C, "¿Qué hay en la página de ejes?|para qué sirve avance por eje|qué muestra la página de ejes estratégicos|cómo se lee avance por eje|qué veo en cada eje",
  "Avance por eje estratégico compara los {{n.ejes}} ejes (indicador, avance {{ant}} y {{vig}} y estados). Cada eje tiene su propia página con las secretarías que participan y sus metas rezagadas.",
  "Avance por eje|#/ejes", "lista_ejes,ind_eje")
I("pagina_secretarias", C, "¿Qué hay en la página de secretarías?|para qué sirve la página de secretarías|qué muestra la ficha de una secretaría|cómo veo una secretaría|qué contiene la sección de secretarías",
  "Secretarías muestra una tarjeta por cada una de las {{n.sec}}, con su indicador y número de metas, gráficos comparativos y el estado de sus metas. Cada ficha incluye su informe y un enlace a sus metas en el explorador.",
  "Secretarías|#/secretarias", "lista_secs,ranking_sec")
I("pagina_explorador", C, "¿Para qué sirve el explorador de metas?|qué es el explorador|qué muestra el explorador de metas|cómo se usa el explorador|qué puedo hacer en el explorador|para qué es la tabla de metas",
  "El Explorador de metas es la tabla con las {{n.registros}} filas de meta. Puedes buscar por texto o código, filtrar por secretaría, eje, estado y vigencia, ordenar columnas, paginar y exportar lo filtrado a CSV. Cada código abre el detalle de la meta.",
  "Explorador de metas|#/metas", "buscar_explorador,filtrar_explorador,exportar_csv")
I("pagina_logros", C, "¿Qué hay en logros y metas cumplidas?|para qué sirve la página de logros|qué muestra logros|dónde veo las metas al 100|qué contiene la sección de logros",
  "Logros y metas cumplidas reúne las metas al 100% o más, separadas entre las certificables y las que tienen programación posterior; puedes filtrarlas por secretaría.",
  "Logros y metas cumplidas|#/logros", "meta_certificable,t4_pendiente")
I("pagina_alertas", C, "¿Qué hay en la página de alertas?|para qué sirve alertas|qué muestra la sección de alertas|dónde veo las metas por acompañar|qué contiene alertas|las alertas son sanciones",
  "Alertas lista las metas rezagadas, las metas en avance con menor indicador (con un umbral que puedes ajustar) y las no programadas. Orienta la gestión; no califica a ninguna dependencia.",
  "Alertas|#/alertas", "que_es_rezagada,rezagadas_lista")
I("pagina_compartidas", C, "¿Qué hay en metas compartidas y calidad de dato?|para qué sirve la página de metas compartidas|qué es calidad de dato|qué muestra la sección de calidad de dato|qué contiene compartidas",
  "Metas compartidas y calidad de dato muestra las metas que reportan varias secretarías, la meta en verificación, el arrastre de {{ant}} y otras observaciones de dato. Son aclaraciones de lectura, no reproches.",
  "Metas compartidas|#/compartidas", "meta_compartida,arrastre")
I("pagina_informes", C, "¿Qué hay en la página de informes?|para qué sirve informes|qué informes puedo descargar|qué contiene la sección de informes|qué documentos hay disponibles",
  "Informes permite descargar, en Word y PDF, el informe general por año y el informe de seguimiento de cada secretaría, con el tamaño de cada archivo.",
  "Informes|#/informes", "descargar_informes,informes_anio")
I("pagina_metodologia", C, "¿Qué hay en metodología y fuentes?|para qué sirve la página de metodología|dónde se explica el cálculo|qué contiene metodología y fuentes|dónde están los créditos",
  "Metodología y fuentes explica el cálculo del indicador, el semáforo, las vigencias y el corte, el glosario, las fuentes de las cifras, las huellas de verificación y los créditos.",
  "Metodología y fuentes|#/metodologia", "como_se_calcula,glosario,huellas")
I("pagina_ficha_secretaria", C, "¿Qué muestra la ficha de una secretaría?|qué hay en la página de una secretaría|cómo abro la ficha de una secretaría|qué información trae cada secretaría|qué veo al entrar a una secretaría",
  "La ficha de una secretaría muestra su indicador, el avance {{ant}} y {{vig}}, el semáforo de sus metas, sus informes y un botón para ver sus metas en el explorador. Se abre desde Secretarías o desde cualquier barra o ranking.",
  "Secretarías|#/secretarias", "pagina_secretarias,ficha_sec")
I("pagina_eje_detalle", C, "¿Qué muestra la página de un eje?|qué hay dentro de un eje|cómo abro un eje|qué veo al entrar a un eje|qué información trae cada eje",
  "La página de un eje muestra su indicador, el avance {{ant}} y {{vig}}, el estado de sus metas, las secretarías que participan y sus metas rezagadas, con botones para ir al eje anterior o siguiente.",
  "Avance por eje|#/ejes", "pagina_ejes,ficha_eje")
I("pagina_meta_detalle", C, "¿Qué muestra la página de una meta?|qué hay en el detalle de una meta|cómo veo todos los datos de una meta|qué información trae una meta|cómo abro una meta",
  "La página de una meta muestra su estado, su código, su secretaría y su eje, las etiquetas de lectura, el cálculo del indicador y, si es compartida, los valores de cada secretaría. Se abre con un clic en el código desde cualquier tabla.",
  "Explorador de metas|#/metas", "pagina_explorador,meta_detalle")
I("menu_contraer", C, "¿Cómo contraigo el menú?|cómo oculto el menú lateral|el menú ocupa mucho espacio|cómo expando el menú|botón de contraer menú|cómo hago el menú más pequeño",
  "Usa el botón «Contraer menú» al pie del menú: queda solo con íconos y, al pasar el cursor, aparece el nombre de cada página. Tu preferencia se recuerda en este navegador.",
  "", "menu_como,modo_noche")
I("menu_movil", C, "¿Cómo uso el portal en el celular?|el portal funciona en móvil|cómo abro el menú en el teléfono|se ve bien en tablet|el portal sirve en celular o en tablet|cómo cierro el menú en el móvil|versión móvil|cómo veo las tablas en el celular",
  "Sí, el portal se adapta al celular: el menú se abre con el botón de las tres rayas (se cierra con Escape o tocando fuera) y las tablas se desplazan de lado cuando tienen muchas columnas. En el celular el explorador muestra cada meta como una tarjeta.",
  "", "menu_como,teclado")
I("buscar_explorador", C, "¿Cómo busco una meta?|cómo busco por palabra|cómo encuentro una meta por código|dónde está el buscador|cómo uso el buscador|puedo buscar por texto|cómo busco una meta por tema",
  "Hay dos formas: el buscador de la barra superior (escribe texto o código y pulsa Enter) o el campo «Buscar» del Explorador de metas, que filtra mientras escribes. Puedes combinar varias palabras; la búsqueda no distingue tildes ni mayúsculas.",
  "Explorador de metas|#/metas", "filtrar_explorador,meta_busqueda")
I("filtrar_explorador", C, "¿Cómo filtro las metas?|cómo filtro por secretaría|puedo filtrar por estado|cómo filtro por eje|cómo combinar filtros|cómo aplico varios filtros a la vez",
  "En el Explorador abre «Filtrar y buscar» y combina secretaría, eje, estado y vigencia. Debajo verás cuántas metas coinciden y puedes limpiar los filtros con un clic.",
  "Explorador de metas|#/metas", "filtro_vigencia,limpiar_filtros,exportar_csv")
I("filtro_vigencia", C, "¿Qué significa el filtro de vigencia?|con programación 2025 qué filtra|qué es sin programación 2026 al corte en el filtro|filtro de vigencia opciones|qué opciones tiene el filtro vigencia|para qué sirve el filtro de vigencia",
  "El filtro Vigencia ofrece: Todas; Con programación {{ant}}; Con programación {{vig}} al corte; Sin programación {{vig}} al corte; y Con programación posterior al corte.",
  "Explorador de metas|#/metas", "filtrar_explorador,arrastre")
I("ordenar_explorador", C, "¿Cómo ordeno la tabla?|cómo ordeno por indicador|cómo cambio el orden de las metas|puedo ordenar columnas|cómo ordeno de mayor a menor|cómo ordeno por secretaría en el explorador",
  "Haz clic en el encabezado de una columna (Código, Meta, Secretaría, Eje, Avance, Indicador o Estado) para ordenar; otro clic invierte el orden. En el celular hay un selector «Ordenar por».",
  "Explorador de metas|#/metas", "filtrar_explorador,paginacion")
I("exportar_csv", C, "¿Cómo exporto a Excel?|cómo descargo la tabla de metas|exportar CSV|puedo descargar los datos|cómo saco las metas a una hoja de cálculo|cómo descargo la tabla filtrada|dónde está el botón de exportar|cómo descargo solo las metas filtradas",
  "En el Explorador de metas, el botón «Exportar CSV de lo filtrado» descarga un archivo (.csv, que abre en Excel) con las metas que estén filtradas: valores programados y ejecutados, avances, indicador y estado.",
  "Explorador de metas|#/metas", "filtrar_explorador,accion_csv")
I("limpiar_filtros", C, "¿Cómo limpio los filtros?|cómo quito un filtro|cómo borro la búsqueda|cómo vuelvo a ver todas las metas|cómo reinicio el explorador|cómo elimino un filtro activo",
  "En el explorador usa «Limpiar filtros». En los filtros globales puedes quitar cada filtro activo con su chip (la «x») o usar el botón «Limpiar».",
  "Explorador de metas|#/metas", "filtros_globales,filtrar_explorador")
I("paginacion", C, "¿Cómo cambio de página en la tabla?|cuántas metas muestra por página|dónde están las demás metas|cómo veo más resultados|por qué solo veo 25 metas|cómo veo las otras metas de la tabla|cómo paso a la siguiente página|cómo avanzo a más metas",
  "El Explorador muestra 25 metas por página. Al pie de la tabla están los botones «Anterior» y «Siguiente» y el número de página; el contador indica cuántas metas coinciden con tus filtros.",
  "Explorador de metas|#/metas", "ordenar_explorador,exportar_csv")
I("filtros_globales", C, "¿Qué son los filtros globales?|cómo funcionan los filtros del resumen|los filtros se recuerdan|cómo quito los filtros activos|qué son los chips de filtros activos|los filtros del resumen afectan las tablas",
  "Los filtros globales (secretaría, eje y estado) recortan lo que ves en el resumen y arman los enlaces al explorador. Se recuerdan en tu navegador; los chips de «Filtros activos» permiten quitarlos uno a uno y «Limpiar» los borra todos.",
  "Resumen ejecutivo|#/resumen", "limpiar_filtros,pagina_resumen")
I("clic_graficos", C, "¿Puedo hacer clic en los gráficos?|los gráficos son interactivos|qué pasa si hago clic en una barra|cómo profundizo desde un gráfico|al hacer clic en el anillo qué pasa|qué pasa al tocar una celda del mapa de calor",
  "Sí. Casi todo es clicable: los sectores del anillo y las celdas del mapa de calor abren el explorador ya filtrado; las barras llevan a la ficha de la secretaría o del eje; y las tarjetas llevan a su detalle. Al pasar el cursor verás el valor exacto.",
  "Resumen ejecutivo|#/resumen", "tabla_del_grafico,como_leer_graficos")
I("tabla_del_grafico", C, "¿Cómo veo los datos de un gráfico en tabla?|hay versión accesible de los gráficos|dónde están los números de las barras|ver los datos del gráfico|cómo copio las cifras de un gráfico|los gráficos tienen tabla",
  "Bajo cada gráfico está «Ver los datos del gráfico en tabla», que despliega los mismos valores en una tabla accesible; sirve para lectores de pantalla y para copiar cifras.",
  "", "clic_graficos,accesibilidad")
I("modo_noche", C, "¿Cómo activo el modo noche?|cómo cambio a modo oscuro|hay modo día y noche|cómo pongo el fondo oscuro|cómo cambio el tema|dónde está el botón de modo oscuro",
  "Con el botón de luna o sol de la barra superior alternas entre modo día y modo noche. Se recuerda tu elección y, si no has elegido, se usa la preferencia de tu dispositivo. Si lo prefieres, dime «activa el modo noche» y lo hago.",
  "", "accesibilidad,menu_contraer")
I("descargar_informes", C, "¿Cómo descargo los informes?|dónde bajo el informe|cómo obtengo el informe en Word|hay informes en PDF|dónde están los informes|cómo se descarga un informe",
  "En la página Informes: el informe general por año y el de cada secretaría, en Word y PDF, con su tamaño. Los Word se descargan; los PDF se abren en una pestaña nueva.",
  "Informes|#/informes", "word_vs_pdf,informes_anio,imprimir")
I("informes_anio", C, "¿Hay informe general de 2025?|dónde está el informe de 2025|informe general por año|puedo ver el informe de gestión de otro año|qué años tienen informe general|hay informe de gestión 2026",
  "", "Informes|#/informes", "descargar_informes,pagina_informes", H="informes_anio")
I("word_vs_pdf", C, "¿Qué diferencia hay entre Word y PDF?|cuál formato me conviene|puedo editar el informe|el PDF se puede imprimir|para qué sirve cada formato del informe|Word o PDF cuál descargo",
  "El Word (.docx) sirve si necesitas editar o reutilizar el texto; el PDF es la versión para leer, compartir e imprimir tal como fue generada. Ambos traen las mismas cifras oficiales.",
  "Informes|#/informes", "descargar_informes,imprimir")
I("imprimir", C, "¿Cómo imprimo una página?|puedo imprimir|cómo guardo en PDF lo que veo|hay botón de impresión|cómo imprimo el resumen|cómo saco una copia en papel",
  "El botón de impresora de la barra superior (en pantallas grandes) imprime la página actual; en el diálogo del navegador también puedes elegir «Guardar como PDF». Para documentos completos usa la página de Informes. Si prefieres, dime «imprime esta página».",
  "Informes|#/informes", "descargar_informes,word_vs_pdf")
I("teclado", C, "¿Se puede usar con teclado?|atajos de teclado|cómo navego sin ratón|accesibilidad por teclado|qué es el enlace de salto|cómo uso el portal solo con el teclado",
  "Sí: todo se puede usar con teclado. Tab recorre enlaces y controles, Enter activa, Escape cierra el menú móvil y al inicio hay un enlace «Saltar al contenido». Las tablas anchas también reciben foco para desplazarlas con las flechas.",
  "", "accesibilidad,menu_movil")
I("accesibilidad", C, "¿Es accesible el portal?|funciona con lector de pantalla|tiene buen contraste|tiene accesibilidad|sirve para personas con discapacidad visual|se puede agrandar la letra|es inclusivo",
  "Se diseñó con accesibilidad: etiquetas ARIA, foco visible, contraste mínimo de 4.5:1, estados con nombre (no solo color), tablas alternativas para los gráficos y compatibilidad con lectores de pantalla. Si encuentras una barrera, avísale a Planeación.",
  "", "teclado,tabla_del_grafico")
I("actualizacion", C, "¿Cada cuánto se actualiza el portal?|cuándo se actualizan los datos|qué tan actuales son las cifras|cuándo sale el próximo corte|se actualiza solo|son datos en tiempo real|cuándo habrá cifras nuevas",
  "Los datos son de un corte: {{corte.texto}}, generado el {{corte.generado}}. El corte se actualiza cada mes y el portal se regenera con las cifras oficiales; no se actualiza en tiempo real.",
  "", "que_es_corte,corte_datos")
I("sin_internet", C, "¿Funciona sin internet?|necesito conexión|puedo usarlo sin conexión|se puede abrir sin internet|usa recursos externos|necesito descargar algo para verlo",
  "El portal no depende de servicios externos (ni fuentes ni librerías en línea), así que, una vez cargado, puedes navegarlo sin conexión. Para descargar informes sí necesitas tener acceso a los archivos.",
  "", "navegadores,privacidad")
I("navegadores", C, "¿En qué navegadores funciona?|funciona en Chrome|funciona en Safari|necesito instalar algo|funciona en Firefox|con qué navegador lo abro",
  "Funciona en navegadores modernos (Chrome, Edge, Firefox y Safari) sin instalar nada.",
  "", "sin_internet,menu_movil")
I("privacidad", C, "¿Guardan mis datos?|el portal recopila información|tienen mis preguntas|es seguro usar el portal|usa cookies|qué guarda el portal de mí",
  "El portal no pide datos personales. Lo único que se guarda, solo en tu navegador, son preferencias como el modo día o noche, el menú y los filtros. Mis respuestas se calculan en tu equipo.",
  "", "sin_internet,como_funciona_nemequi")
I("compartir_enlace", C, "¿Cómo comparto lo que estoy viendo?|puedo copiar el enlace de un filtro|comparto una búsqueda con un colega|el enlace guarda los filtros|cómo envío esta vista a otra persona|cómo copio la dirección de la página",
  "Sí: el explorador actualiza la dirección con los filtros activos (secretaría, eje, estado, vigencia y texto), así que puedes copiar el enlace desde la barra del navegador y enviarlo; quien lo abra verá la misma vista.",
  "Explorador de metas|#/metas", "filtrar_explorador,exportar_csv")
I("como_usar_nemequi", C, "¿Cómo te hago preguntas?|cómo te uso|qué tipo de preguntas entiendes|puedo escribir preguntas libres|cómo pregunto|cómo hablo contigo|tengo que escribir de alguna forma|puedo escribirte con mis palabras",
  "Escribe tu pregunta con tus palabras, como se la harías a una compañera: «¿cuántas metas rezagadas tiene Gobierno?», «¿qué es el semáforo?» o «llévame a las alertas». Si no te entiendo, te propongo opciones parecidas. Después de una respuesta puedes seguir con «¿y la de Hacienda?».",
  "", "que_puedes_hacer,ejemplos_preguntas")
I("huellas", C, "¿Qué son las huellas de verificación?|para qué sirven las huellas|qué es la verificación técnica|cómo sé que los datos no cambiaron|qué es una huella de los datos|dónde veo las huellas",
  "En Metodología y fuentes hay una «Verificación técnica» con huellas (códigos cortos) de cada conjunto de cifras: permiten comprobar que lo publicado corresponde a las entradas oficiales del corte.",
  "Metodología y fuentes|#/metodologia", "no_recalcula,fuentes_datos")

# ====================================================== METODOLOGÍA
C = "metodologia"
I("metodologia_dnp", C, "¿Qué metodología usa el portal?|en qué se basa el seguimiento|cuál es la metodología de cálculo|cómo hacen el seguimiento al plan|resúmeme la metodología|qué método usan para medir el avance",
  "Se sigue la metodología del DNP: para cada meta se compara el ejecutado acumulado con el programado acumulado al corte; los indicadores de secretaría y eje son medias simples de sus metas programadas; el institucional es la media de las {{n.sec}} secretarías; y el semáforo clasifica el resultado.",
  "Metodología|#/metodologia", "como_se_calcula,colores_semaforo,calculo_institucional")
I("no_recalcula", C, "¿El portal recalcula las cifras?|puedo confiar en los datos|quién garantiza las cifras|las cifras son oficiales|los números son confiables|quién valida los datos",
  "El portal no recalcula nada: muestra las cifras oficiales del corte, generadas una sola vez por el proceso de seguimiento a partir de los reportes de las secretarías, y las huellas de verificación permiten comprobarlas.",
  "Metodología y fuentes|#/metodologia", "huellas,fuentes_datos")
I("formato_decimal", C, "¿Con cuántos decimales se muestran las cifras?|por qué usan punto decimal|cómo se redondean los porcentajes|por qué 95.9%|se redondea el indicador|por qué los decimales",
  "Los porcentajes se muestran con un decimal y punto decimal (por ejemplo, {{sec_top.ind|p}}). Los cálculos usan el valor oficial y solo se redondea para mostrarlo.",
  "", "como_se_calcula")
I("meta_programada_al_corte", C, "¿Cuándo una meta se considera programada al corte?|qué es una meta programada|qué metas entran en el promedio|cuáles metas se miden|cuándo una meta entra al indicador|qué metas cuentan para el indicador",
  "Una meta es programada al corte cuando tiene programación acumulada hasta el corte, en {{ant}} o en {{vig}} hasta {{corte.trimestre}}. Solo esas metas entran en el promedio; hoy son {{inst.programadas}} de {{inst.metas}}.",
  "", "pnp,por_que_no_penaliza")
I("frecuencia_corte", C, "¿Cada cuánto hay un corte?|con qué frecuencia se mide|el corte es mensual|cuándo se hace el seguimiento|cada cuánto se reportan las secretarías|cuál es la periodicidad del seguimiento",
  "El corte se actualiza cada mes: cada secretaría reporta sus avances, Planeación consolida y el portal se regenera con las cifras oficiales. El corte actual es {{corte.texto}}.",
  "", "actualizacion,que_es_corte")
I("jerarquia_indicadores", C, "¿Cómo se relacionan meta, secretaría, eje e institucional?|qué orden de agregación tiene el indicador|de la meta al institucional cómo se llega|cómo se agregan las metas hasta el indicador general|jerarquía de los indicadores|cómo se suman los indicadores por niveles",
  "Primero se calcula el indicador de cada meta (ejecutado ÷ programado acumulados). Luego, el de una secretaría o de un eje promedia sus metas programadas. Por último, el institucional promedia las {{n.sec}} secretarías. Cada nivel es una media simple.",
  "Metodología|#/metodologia", "como_se_calcula,calculo_institucional")

# ====================================================== FUENTES
C = "fuentes"
I("fuentes_datos", C, "¿De dónde salen las cifras?|cuáles son las fuentes|qué fuentes usa el portal|de dónde vienen los datos|quién reporta los datos|qué archivos se usaron|en qué se basan los datos",
  "", "Metodología y fuentes|#/metodologia", "no_recalcula,huellas,metodologia_dnp", H="fuentes")
I("creditos", C, "¿Quién elaboró el portal?|quién hizo el tablero|créditos|quién lo desarrolló|de quién es este portal|quién es Javier Galindo|quién está detrás del seguimiento",
  "El portal fue elaborado por el profesional Javier Galindo Bernal, Administrador Público y Especialista en Big Data y Analítica de Datos, en la Secretaría de Planeación y Servicios Públicos de Gachancipá, Cundinamarca (2026). La identidad visual se basa en el sistema GOV.CO.",
  "Metodología y fuentes|#/metodologia", "fuentes_datos,sede_electronica")
I("sede_electronica", C, "¿Dónde está la página de la Alcaldía?|sitio web oficial de Gachancipá|sede electrónica de la alcaldía|dónde veo más información de la alcaldía|cuál es la página oficial|enlace de la alcaldía",
  "La sede electrónica de la Alcaldía de Gachancipá está en gachancipa-cundinamarca.gov.co; allí encuentras trámites, noticias y datos de contacto. Este portal es solo de seguimiento al Plan.",
  "Metodología y fuentes|#/metodologia", "creditos,lim_tramites")
I("reportes_secretarias", C, "¿Quién alimenta los datos?|quién reporta el avance de las metas|cómo reportan las secretarías|de dónde sacan los datos las secretarías|quién carga la información de cada meta|cómo llega el avance de cada secretaría a Planeación|qué hacen las secretarías para reportar",
  "Cada secretaría reporta el avance de sus metas en su archivo de seguimiento, con corte a la fecha acordada. Planeación y Servicios Públicos consolida, valida contra la fuente y genera las cifras oficiales que muestra el portal.",
  "Metodología y fuentes|#/metodologia", "no_recalcula,frecuencia_corte")
I("datos_para_descargar", C, "¿Puedo usar los datos en mis propios análisis?|dónde descargo los datos abiertos|cómo obtengo la base de datos de metas|puedo descargar toda la base|hay archivo con todas las metas|cómo saco todos los datos del portal",
  "Sí: en el Explorador de metas puedes exportar a CSV todas las metas o solo las filtradas (programado, ejecutado, avances, indicador y estado). Los informes en Word y PDF están en la página Informes.",
  "Explorador de metas|#/metas", "exportar_csv,descargar_informes")
