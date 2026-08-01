# Flujo de Evaluación de Supervisores (Visita Dual)

Este documento describe el proceso para que los Supervisores y Gerentes realicen evaluaciones de campo (acompañamientos) a los Visitadores Médicos, utilizando la nueva funcionalidad implementada.

## 1. Acceso a la Evaluación

La evaluación se realiza directamente desde el **detalle de una visita** completada o en curso. Esto asegura que la evaluación esté vinculada a una interacción real con un médico o farmacia.

### Pasos

1. Ingresar al **Dashboard** o **Agenda**.
2. Abrir el detalle de una visita (haciendo clic en la visita agendada o realizada).
3. Si su rol es **Supervisor**, **Coordinador**, **Gerente** o **Master**, verá un botón dorado en la parte inferior:
    * 🔘 **Evaluar (Supervisor)**

> **Nota:** Este botón solo es visible si la visita ya está guardada (tiene un ID).

## 2. Formulario de Evaluación (Modal)

Al hacer clic en "Evaluar", se despliega un formulario modal centrado en competencias clave:

### A. Competencias Técnicas (Escala 1-5 Estrellas)

* **Dominio del Vademécum**: Conocimiento profundo del producto (Mecanismo de acción, posología, beneficios).
* **Manejo de Objeciones**: Capacidad para responder a dudas o resistencias del médico con argumentos sólidos.
* **Cierre de Venta**: Habilidad para lograr un compromiso de prescripción ("¿Puedo contar con su apoyo para los próximos 3 pacientes?").
* **Planning Pre-Visita**: ¿El visitador tenía un objetivo claro antes de entrar o improvisó?

### B. Estrategia de Muestras

* **Checkbox**: "¿Usó las muestras estratégicamente?"
  * *Correcto*: Dejó muestras para iniciar tratamiento a un paciente específico.
  * *Incorrecto*: Dejó muestras "por dejar" o como regalo sin compromiso.

### C. Feedback Cualitativo (Texto)

* **Fortalezas**: Qué hizo bien (para reforzar conductas positivas).
* **Áreas de Mejora**: Qué debe corregir.
* **Plan de Acción**: Acuerdos concretos para la próxima supervisión.

## 3. Visualización de Resultados (Scorecard)

Los resultados impactan inmediatamente en el **Scorecard 360°** del Visitador.

* **Ubicación**: Dashboard del Visitador > Tarjeta "Calidad Técnica".
* **Métrica**: Promedio mensual de todas las evaluaciones recibidas.
* **Feedback Visual**:
  * 🟢 **> 4.5**: Excelente (Verde)
  * 🟡 **3.5 - 4.5**: Regular (Ámbar)
  * 🔴 **< 3.5**: Riesgo (Rojo)

## 4. Base de Datos

Las evaluaciones se guardan en la tabla `field_evaluations` de Supabase, vinculando:

* `visit_id`: La visita específica.
* `supervisor_id`: Quién evaluó.
* `representative_id`: Quién fue evaluado.
* `created_at`: Fecha de la evaluación.

## Próximos Pasos Recomendados

1. Crear un reporte consolidado para Gerencia que muestre el ranking de evaluaciones por equipo.
2. Implementar notificaciones automáticas al Visitador cuando reciba una nueva evaluación.
