AKC PRO — V3 RESPONSIVO

Objetivo:
Corregir únicamente el contenedor principal de AKC PRO para que se adapte al ancho y alto del dispositivo.

CAMBIOS:
- Se elimina el límite max-width:420px que hacía que tabletas y laptops se vieran como celular.
- AKC PRO ahora ocupa el ancho real disponible de la pantalla.
- El visor iframe ocupa el 100% del espacio disponible.
- Se agregan unidades responsive (clamp, vw, vh, dvh) para adaptar botones y textos.
- En pantallas grandes el menú pasa a 2 y después 3 columnas.
- Se conserva el botón Normativos AKC y su contraseña Akcgav.
- La contraseña se sigue solicitando cada vez que se presiona Normativos.
- No se modifica ningún repositorio interno.
- No se modifica Firebase ni los datos de Normativos.
- No se modifica la lógica de Excel de los repositorios.

INSTALACIÓN:
Reemplazar en el repositorio GAV-APP-AKC solamente:
- index.html
- script.js
- style.css

CONSERVAR:
- logo.png
- cualquier otro archivo que ya exista en el repositorio.

Después de publicar en GitHub Pages, probar AKC PRO en:
1. Celular vertical
2. Celular horizontal
3. Tablet vertical
4. Tablet horizontal
5. Laptop/PC

NOTA:
La capacidad de zoom dentro de cada repositorio depende también del viewport y CSS del propio repositorio. Esta V3 corrige primero el contenedor de AKC PRO. Los repositorios se ajustarán posteriormente uno por uno, como parte del siguiente paso.
