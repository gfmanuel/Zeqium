# Zeqium — Identidad Auto-Soberana (SSI) para el Sector Hotelero

Zeqium es un ecosistema de identidad digital auto-soberana (SSI) diseñado para revolucionar el sector hotelero, resolviendo los problemas actuales de privacidad y devolviendo el control total de los datos al huésped. 

El proyecto conecta a autoridades emisoras (Policía) con establecimientos verificadores (Hoteles) creando un flujo de confianza digital sin precedentes. Su arquitectura garantiza la privacidad por diseño mediante la divulgación selectiva y la criptografía avanzada. Esto permite verificar la identidad del usuario en menos de un segundo sin retener copias de documentos ni datos personales excesivos, garantizando una experiencia sin fricciones y el cumplimiento estricto del RGPD.

---

## 🏗️ Arquitectura del Sistema

La solución está construida bajo una arquitectura de cuatro capas altamente escalable, separando el entorno móvil, las interfaces de usuario, la lógica de negocio y la capa de confianza descentralizada.

### CAPA 1: Frontend Móvil
Representa el lado del titular de la identidad (el huésped) a través de la **Zeqium Wallet App** (React Native). Esta capa centraliza la seguridad del usuario y gestiona:
* **Módulo Escáner:** Captura e interpretación de los códigos QR institucionales para iniciar los flujos de comunicación.
* **Almacenamiento Cifrado y Base de Datos Local:** Protección de las claves privadas en el hardware del dispositivo y gestión del estado de las credenciales del usuario de forma aislada.
* **Motor Criptográfico:** Encargado de las operaciones matemáticas de alta seguridad, la gestión de firmas y la generación de presentaciones con divulgación selectiva para compartir solo lo necesario.

### CAPA 2: Portales Web
Interfaces gráficas orientadas a la operativa de las instituciones que participan en el ecosistema:
* **Portal Policial (Autoridad Emisora):** Entorno de administración que proporciona los formularios y herramientas necesarias para la emisión oficial de los DNI digitales hacia los dispositivos de los ciudadanos.
* **Portal Hotelero (Establecimiento Verificador):** Interfaz para recepcionistas que incluye el terminal de validación de huéspedes y un panel de control con actualizaciones de registro en tiempo real.

### CAPA 3: Middleware y Gateway
El núcleo lógico del sistema. Actúa como puente de comunicación bidireccional entre las interfaces de usuario y la red blockchain, orquestado a través de un proxy inverso.
* **API Policial:** Gestiona la lógica de emisión, empaquetando las credenciales verificables y anclando los registros públicos de los identificadores en la red descentralizada.
* **API Hotelera:** Responsable de la validación criptográfica de las respuestas de los usuarios. Gestiona la prevención de ataques de repetición (Anti-Replay), el descifrado seguro de los paquetes de datos y el registro persistente de las estancias en bases de datos relacionales propias.

### CAPA 4: Red Blockchain On-Chain
La capa de confianza distribuida, construida sobre una red **Hyperledger Fabric** de carácter permisionado.
* **Organizaciones y Nodos:** Estructurada mediante clústeres de nodos y sistemas de ordenamiento que garantizan la alta disponibilidad y la sincronización del estado mundial.
* **Smart Contract y Consenso:** Aloja la lógica de negocio inmutable (gobernanza de credenciales, revocaciones y registros de auditoría), ejecutada bajo políticas de endoso estrictas entre las organizaciones participantes.
