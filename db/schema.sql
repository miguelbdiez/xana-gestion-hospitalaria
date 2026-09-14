-- Esquema de la base de datos `xanadb`
-- Sistema de gestion hospitalaria Xana
--
-- Generado a partir del volcado de estructura del proyecto.
-- Contiene unicamente la definicion de tablas, claves y restricciones:
-- ningun dato de pacientes ni de usuarios.
--
-- Uso:
--   mysql -u root -p -e "CREATE DATABASE xanadb CHARACTER SET utf8mb4;"
--   mysql -u root -p xanadb < db/schema.sql

-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: xanadb
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AdministracionesDeMedicacionPaciente`
--

DROP TABLE IF EXISTS `AdministracionesDeMedicacionPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AdministracionesDeMedicacionPaciente` (
  `id_administracion` int NOT NULL AUTO_INCREMENT,
  `id_medicacion` int NOT NULL,
  `id_medicamento` int NOT NULL,
  `unidades_utilizadas` int NOT NULL,
  `paciente_id` varchar(50) NOT NULL,
  `ingreso_id` int NOT NULL,
  `enfermero_id` binary(16) NOT NULL,
  `nombre_enfermero` varchar(255) NOT NULL,
  `notas` text,
  `fecha_administracion` datetime NOT NULL,
  `nombre_medicamento` varchar(100) NOT NULL,
  PRIMARY KEY (`id_administracion`),
  KEY `id_medicacion` (`id_medicacion`),
  KEY `enfermero_id` (`enfermero_id`),
  KEY `ingreso_id` (`ingreso_id`),
  CONSTRAINT `AdministracionesDeMedicacionPaciente_ibfk_1` FOREIGN KEY (`id_medicacion`) REFERENCES `MedicacionPaciente` (`id_medicacion`) ON DELETE CASCADE,
  CONSTRAINT `AdministracionesDeMedicacionPaciente_ibfk_2` FOREIGN KEY (`enfermero_id`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `AdministracionesDeMedicacionPaciente_ibfk_3` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AdministracionesDeMedicacionPaciente`
--

LOCK TABLES `AdministracionesDeMedicacionPaciente` WRITE;
/*!40000 ALTER TABLE `AdministracionesDeMedicacionPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `AdministracionesDeMedicacionPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AltasMedicas`
--

DROP TABLE IF EXISTS `AltasMedicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AltasMedicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_alta` varchar(50) DEFAULT NULL,
  `fecha_alta` datetime DEFAULT NULL,
  `destino_alta` varchar(50) DEFAULT NULL,
  `profesional_nombre` varchar(100) DEFAULT NULL,
  `diagnostico_principal` text,
  `diagnosticos_secundarios` text,
  `procedimientos` text,
  `motivo_ingreso` text,
  `evolucion_clinica` text,
  `tratamiento_realizado` text,
  `tratamiento_alta` text,
  `plan_seguimiento` text,
  `indicaciones_paciente` text,
  `nivel_dependencia` varchar(50) DEFAULT NULL,
  `riesgos_alta` text,
  `paciente_nombre_completo` varchar(100) DEFAULT NULL,
  `documento_identificacion_paciente` varchar(50) NOT NULL,
  `cama_id` varchar(50) DEFAULT NULL,
  `ingreso_id` int NOT NULL,
  `historia_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_altas_pacientes` (`documento_identificacion_paciente`),
  KEY `fk_altas_ingresados` (`ingreso_id`),
  KEY `fk_altas_historias` (`historia_id`),
  CONSTRAINT `fk_altas_historias` FOREIGN KEY (`historia_id`) REFERENCES `Historias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_altas_ingresados` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_altas_pacientes` FOREIGN KEY (`documento_identificacion_paciente`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AltasMedicas`
--

LOCK TABLES `AltasMedicas` WRITE;
/*!40000 ALTER TABLE `AltasMedicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `AltasMedicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Camas`
--

DROP TABLE IF EXISTS `Camas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Camas` (
  `cama_id` varchar(50) NOT NULL,
  `especialidad` varchar(50) DEFAULT NULL,
  `ocupada` tinyint(1) NOT NULL DEFAULT '0',
  `bloqueado` tinyint(1) NOT NULL DEFAULT '0',
  `panelPaciente` longblob,
  `panelBloqueado` longblob,
  `panelLibre` longblob,
  `id_ingreso` int DEFAULT '-1',
  PRIMARY KEY (`cama_id`),
  KEY `especialidad` (`especialidad`),
  CONSTRAINT `Camas_ibfk_1` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Camas`
--

LOCK TABLES `Camas` WRITE;
/*!40000 ALTER TABLE `Camas` DISABLE KEYS */;
/*!40000 ALTER TABLE `Camas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Especialidad`
--

DROP TABLE IF EXISTS `Especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Especialidad` (
  `especialidad` varchar(50) NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `numero_camas` int NOT NULL DEFAULT '0',
  `nombreHospital` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`especialidad`),
  KEY `fk_especialidad_hospital` (`nombreHospital`),
  CONSTRAINT `fk_especialidad_hospital` FOREIGN KEY (`nombreHospital`) REFERENCES `Hospital` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Especialidad`
--

LOCK TABLES `Especialidad` WRITE;
/*!40000 ALTER TABLE `Especialidad` DISABLE KEYS */;
/*!40000 ALTER TABLE `Especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Historias`
--

DROP TABLE IF EXISTS `Historias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Historias` (
  `id` int NOT NULL,
  `documento_identificacion_paciente` varchar(50) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `documento_identificacion_paciente` (`documento_identificacion_paciente`),
  CONSTRAINT `Historias_ibfk_1` FOREIGN KEY (`documento_identificacion_paciente`) REFERENCES `Pacientes` (`documento_identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Historias`
--

LOCK TABLES `Historias` WRITE;
/*!40000 ALTER TABLE `Historias` DISABLE KEYS */;
/*!40000 ALTER TABLE `Historias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Hospital`
--

DROP TABLE IF EXISTS `Hospital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Hospital` (
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Hospital`
--

LOCK TABLES `Hospital` WRITE;
/*!40000 ALTER TABLE `Hospital` DISABLE KEYS */;
/*!40000 ALTER TABLE `Hospital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Incidencias`
--

DROP TABLE IF EXISTS `Incidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Incidencias` (
  `id_incidencia` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int DEFAULT NULL,
  `informacion_incidencia` text,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_emision` datetime DEFAULT NULL,
  `cama_id` varchar(50) DEFAULT NULL,
  `fecha_desactivacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_incidencia`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Incidencias`
--

LOCK TABLES `Incidencias` WRITE;
/*!40000 ALTER TABLE `Incidencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `Incidencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ingresados`
--

DROP TABLE IF EXISTS `Ingresados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ingresados` (
  `ingreso_id` int NOT NULL AUTO_INCREMENT,
  `documento_identificacion_paciente` varchar(50) NOT NULL,
  `medico_id` binary(16) NOT NULL,
  `paciente_nombre_completo` varchar(255) NOT NULL,
  `medico_nombre_completo` varchar(255) NOT NULL,
  `especialidad` varchar(50) NOT NULL,
  `cama_id` varchar(50) NOT NULL,
  `fecha_ini` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_fin` datetime DEFAULT NULL,
  `motivo_ingreso` text NOT NULL,
  `tipo_alergia` enum('leve','moderada','grave','non') DEFAULT 'non',
  `alergia` varchar(255) DEFAULT '',
  `incidencia` tinyint(1) DEFAULT '0',
  `balance` tinyint(1) DEFAULT '0',
  `escala_barthel` int DEFAULT '-1',
  `tipo_via` enum('VVP','VC','non') DEFAULT 'non',
  `aislamiento` tinyint(1) DEFAULT '0',
  `tipo_dieta` enum('normal','blanda','liquidos','non') DEFAULT 'non',
  `dieta` varchar(255) DEFAULT '',
  `diagnostico` text,
  `grupo_rh` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `historia_id` int DEFAULT NULL,
  PRIMARY KEY (`ingreso_id`),
  KEY `fk_paciente` (`documento_identificacion_paciente`),
  KEY `fk_medico` (`medico_id`),
  KEY `fk_ingresados_especialidad` (`especialidad`),
  KEY `fk_cama` (`cama_id`),
  KEY `fk_ingresados_historia` (`historia_id`),
  CONSTRAINT `fk_cama` FOREIGN KEY (`cama_id`) REFERENCES `Camas` (`cama_id`),
  CONSTRAINT `fk_ingresados_especialidad` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`),
  CONSTRAINT `fk_ingresados_historia` FOREIGN KEY (`historia_id`) REFERENCES `Historias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_medico` FOREIGN KEY (`medico_id`) REFERENCES `Medicos` (`id`),
  CONSTRAINT `fk_paciente` FOREIGN KEY (`documento_identificacion_paciente`) REFERENCES `Pacientes` (`documento_identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ingresados`
--

LOCK TABLES `Ingresados` WRITE;
/*!40000 ALTER TABLE `Ingresados` DISABLE KEYS */;
/*!40000 ALTER TABLE `Ingresados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `InventarioFarmacia`
--

DROP TABLE IF EXISTS `InventarioFarmacia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `InventarioFarmacia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lote` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('Medicamento','Material Sanitario') NOT NULL,
  `cantidad` int NOT NULL,
  `fecha_caducidad` datetime DEFAULT NULL,
  `fecha_pedido` datetime DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `especialidad` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `especialidad` (`especialidad`),
  CONSTRAINT `InventarioFarmacia_ibfk_1` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`) ON DELETE SET NULL,
  CONSTRAINT `InventarioFarmacia_chk_1` CHECK ((`cantidad` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `InventarioFarmacia`
--

LOCK TABLES `InventarioFarmacia` WRITE;
/*!40000 ALTER TABLE `InventarioFarmacia` DISABLE KEYS */;
/*!40000 ALTER TABLE `InventarioFarmacia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Llamadas`
--

DROP TABLE IF EXISTS `Llamadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Llamadas` (
  `id_llamada` int NOT NULL AUTO_INCREMENT,
  `id_emisor` binary(16) DEFAULT NULL,
  `id_receptor` binary(16) DEFAULT NULL,
  `nombreEmisor` varchar(50) DEFAULT NULL,
  `nombreReceptor` varchar(50) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `duracion` int DEFAULT NULL,
  PRIMARY KEY (`id_llamada`),
  KEY `id_emisor` (`id_emisor`),
  KEY `id_receptor` (`id_receptor`),
  CONSTRAINT `Llamadas_ibfk_1` FOREIGN KEY (`id_emisor`) REFERENCES `empleados` (`id`),
  CONSTRAINT `Llamadas_ibfk_2` FOREIGN KEY (`id_receptor`) REFERENCES `empleados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Llamadas`
--

LOCK TABLES `Llamadas` WRITE;
/*!40000 ALTER TABLE `Llamadas` DISABLE KEYS */;
/*!40000 ALTER TABLE `Llamadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MedicacionPaciente`
--

DROP TABLE IF EXISTS `MedicacionPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MedicacionPaciente` (
  `id_medicacion` int NOT NULL AUTO_INCREMENT,
  `nombre_medicamento` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `via_administracion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_medicamento` int NOT NULL,
  `dosis` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia_horas` float NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `numero_dosis` int DEFAULT NULL,
  `paciente_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `medico_id` binary(16) NOT NULL,
  `ingreso_id` int NOT NULL,
  `estado` enum('Activa','Pausada','Finalizada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activa',
  `lote_medicamento` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activa',
  PRIMARY KEY (`id_medicacion`),
  KEY `fk_medicacion_medicamento` (`id_medicamento`),
  KEY `fk_medicacion_paciente` (`paciente_id`),
  KEY `fk_medicacion_medico` (`medico_id`),
  KEY `fk_medicacion_ingreso` (`ingreso_id`),
  CONSTRAINT `fk_medicacion_ingreso` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_medicacion_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `InventarioFarmacia` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_medicacion_medico` FOREIGN KEY (`medico_id`) REFERENCES `Medicos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_medicacion_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MedicacionPaciente`
--

LOCK TABLES `MedicacionPaciente` WRITE;
/*!40000 ALTER TABLE `MedicacionPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `MedicacionPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Medicos`
--

DROP TABLE IF EXISTS `Medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Medicos` (
  `id` binary(16) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido1` varchar(100) NOT NULL,
  `apellido2` varchar(100) NOT NULL,
  `departamento` varchar(100) NOT NULL,
  `numero_pacientes` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Medicos`
--

LOCK TABLES `Medicos` WRITE;
/*!40000 ALTER TABLE `Medicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `Medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MensajesChat`
--

DROP TABLE IF EXISTS `MensajesChat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MensajesChat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emisor` binary(16) NOT NULL,
  `receptor` binary(16) NOT NULL,
  `contenido` text,
  `fecha` datetime DEFAULT NULL,
  `leido` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `emisor` (`emisor`),
  KEY `receptor` (`receptor`),
  CONSTRAINT `MensajesChat_ibfk_1` FOREIGN KEY (`emisor`) REFERENCES `empleados` (`id`),
  CONSTRAINT `MensajesChat_ibfk_2` FOREIGN KEY (`receptor`) REFERENCES `empleados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MensajesChat`
--

LOCK TABLES `MensajesChat` WRITE;
/*!40000 ALTER TABLE `MensajesChat` DISABLE KEYS */;
/*!40000 ALTER TABLE `MensajesChat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MensajesMail`
--

DROP TABLE IF EXISTS `MensajesMail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MensajesMail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emisorMail` varchar(100) NOT NULL,
  `receptorMail` varchar(100) NOT NULL,
  `asunto` varchar(255) DEFAULT NULL,
  `contenido` text,
  `fecha` datetime DEFAULT NULL,
  `guardado` tinyint(1) DEFAULT '0',
  `eliminado` tinyint(1) DEFAULT '0',
  `favorito` tinyint(1) DEFAULT '0',
  `leido` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `emisorMail` (`emisorMail`),
  KEY `receptorMail` (`receptorMail`),
  CONSTRAINT `MensajesMail_ibfk_1` FOREIGN KEY (`emisorMail`) REFERENCES `empleados` (`correo_electronico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MensajesMail_ibfk_2` FOREIGN KEY (`receptorMail`) REFERENCES `empleados` (`correo_electronico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MensajesMail`
--

LOCK TABLES `MensajesMail` WRITE;
/*!40000 ALTER TABLE `MensajesMail` DISABLE KEYS */;
/*!40000 ALTER TABLE `MensajesMail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notificaciones`
--

DROP TABLE IF EXISTS `Notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` binary(16) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `tipo_notificacion` enum('tipo_horario','tipo_mensaje','tipo_llamada','tipo_mail','tipo_bandeja_documentos','tipo_caducidad_3_dias_lote','tipo_caducidad_1_dias_lote') DEFAULT NULL,
  `contenido_notificacion` text,
  `leido` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notificaciones`
--

LOCK TABLES `Notificaciones` WRITE;
/*!40000 ALTER TABLE `Notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NotificacionesAutomaticas`
--

DROP TABLE IF EXISTS `NotificacionesAutomaticas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NotificacionesAutomaticas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contenido` varchar(255) NOT NULL,
  `tipo_notificacion` varchar(50) NOT NULL,
  `id_receptor` binary(16) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `estado` enum('Pendiente','Enviada','Cancelada') DEFAULT 'Pendiente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NotificacionesAutomaticas`
--

LOCK TABLES `NotificacionesAutomaticas` WRITE;
/*!40000 ALTER TABLE `NotificacionesAutomaticas` DISABLE KEYS */;
/*!40000 ALTER TABLE `NotificacionesAutomaticas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Pacientes`
--

DROP TABLE IF EXISTS `Pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pacientes` (
  `documento_identificacion` varchar(50) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `apellido_1` varchar(50) NOT NULL,
  `apellido_2` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo_electronico` varchar(100) DEFAULT NULL,
  `persona_emergencia` varchar(255) DEFAULT NULL,
  `telefono_emergencia` varchar(15) DEFAULT NULL,
  `nacionalidad` varchar(50) DEFAULT NULL,
  `sexo` enum('Hombre','Mujer','Otro') DEFAULT 'Otro',
  `historia_id` int DEFAULT NULL,
  PRIMARY KEY (`documento_identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Pacientes`
--

LOCK TABLES `Pacientes` WRITE;
/*!40000 ALTER TABLE `Pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PedidosFarmacia`
--

DROP TABLE IF EXISTS `PedidosFarmacia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PedidosFarmacia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('Medicamento','Material Sanitario') NOT NULL,
  `notas` text,
  `fecha_pedido` datetime NOT NULL,
  `estado` enum('Pendiente','Completado','Extraviado') NOT NULL DEFAULT 'Pendiente',
  `especialidad` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_especialidad_pedidos` (`especialidad`),
  CONSTRAINT `fk_especialidad_pedidos` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PedidosFarmacia`
--

LOCK TABLES `PedidosFarmacia` WRITE;
/*!40000 ALTER TABLE `PedidosFarmacia` DISABLE KEYS */;
/*!40000 ALTER TABLE `PedidosFarmacia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ZonaDeTrabajoEnfermeria`
--

DROP TABLE IF EXISTS `ZonaDeTrabajoEnfermeria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ZonaDeTrabajoEnfermeria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_enfermero` binary(16) DEFAULT NULL,
  `cama_id` varchar(255) DEFAULT NULL,
  `especialidad` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ZonaDeTrabajoEnfermeria`
--

LOCK TABLES `ZonaDeTrabajoEnfermeria` WRITE;
/*!40000 ALTER TABLE `ZonaDeTrabajoEnfermeria` DISABLE KEYS */;
/*!40000 ALTER TABLE `ZonaDeTrabajoEnfermeria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `balanceDetallesPaciente`
--

DROP TABLE IF EXISTS `balanceDetallesPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `balanceDetallesPaciente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `sueroterapia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `nutricion_parenteral` decimal(10,2) NOT NULL DEFAULT '0.00',
  `hemoderivados` decimal(10,2) NOT NULL DEFAULT '0.00',
  `agua_endogena` decimal(10,2) NOT NULL DEFAULT '0.00',
  `alimentos_liquidos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `formula_enteral` decimal(10,2) NOT NULL DEFAULT '0.00',
  `medicacion` decimal(10,2) NOT NULL DEFAULT '0.00',
  `otros_entradas` decimal(10,2) NOT NULL DEFAULT '0.00',
  `diuresis` decimal(10,2) NOT NULL DEFAULT '0.00',
  `drenaje` decimal(10,2) NOT NULL DEFAULT '0.00',
  `vomitos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `deposiciones` decimal(10,2) NOT NULL DEFAULT '0.00',
  `aspiracion_gastrica` decimal(10,2) NOT NULL DEFAULT '0.00',
  `perdidas_sensibles` decimal(10,2) NOT NULL DEFAULT '0.00',
  `otros_salidas` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  CONSTRAINT `balanceDetallesPaciente_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balanceDetallesPaciente`
--

LOCK TABLES `balanceDetallesPaciente` WRITE;
/*!40000 ALTER TABLE `balanceDetallesPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `balanceDetallesPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `balanceResumenPaciente`
--

DROP TABLE IF EXISTS `balanceResumenPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `balanceResumenPaciente` (
  `id` int NOT NULL,
  `entradas` decimal(10,2) NOT NULL DEFAULT '0.00',
  `salidas` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `ingreso_id` int NOT NULL,
  `id_trabajador` binary(16) NOT NULL,
  `nombre_trabajador` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  KEY `ingreso_id` (`ingreso_id`),
  CONSTRAINT `balanceResumenPaciente_ibfk_1` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `balanceResumenPaciente_ibfk_2` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `balanceResumenPaciente_ibfk_3` FOREIGN KEY (`id`) REFERENCES `balanceDetallesPaciente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balanceResumenPaciente`
--

LOCK TABLES `balanceResumenPaciente` WRITE;
/*!40000 ALTER TABLE `balanceResumenPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `balanceResumenPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `constantesPaciente`
--

DROP TABLE IF EXISTS `constantesPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `constantesPaciente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `paciente_id` varchar(50) NOT NULL,
  `id_trabajador` binary(16) NOT NULL,
  `cama_id` varchar(50) NOT NULL,
  `historia` int NOT NULL,
  `temperatura` decimal(5,1) DEFAULT NULL,
  `tos` varchar(50) DEFAULT NULL,
  `disnea` varchar(50) DEFAULT NULL,
  `saturacionO2` int DEFAULT NULL,
  `frecCardiaca` int DEFAULT NULL,
  `tas` int DEFAULT NULL,
  `tad` int DEFAULT NULL,
  `frecRespiratoria` int DEFAULT NULL,
  `glucemia` int DEFAULT NULL,
  `insulinaBasal` int DEFAULT NULL,
  `insulinaRapida` int DEFAULT NULL,
  `concO2` int DEFAULT NULL,
  `oxigeno` decimal(5,1) DEFAULT NULL,
  `dispositivos` varchar(50) DEFAULT NULL,
  `peso` decimal(5,1) DEFAULT NULL,
  `talla` decimal(5,1) DEFAULT NULL,
  `perimetroAbdominal` decimal(5,1) DEFAULT NULL,
  `imc` decimal(5,1) DEFAULT NULL,
  `perdidaPeso` decimal(5,1) DEFAULT NULL,
  `pesoIngreso` decimal(5,1) DEFAULT NULL,
  `ingestaOral` int DEFAULT NULL,
  `aguaEndogena` int DEFAULT NULL,
  `medicacion` int DEFAULT NULL,
  `hemoderivados` int DEFAULT NULL,
  `nutricionEnteral` int DEFAULT NULL,
  `sueroterapia` int DEFAULT NULL,
  `aguaEnteral` int DEFAULT NULL,
  `sueroLavadorEntrada` int DEFAULT NULL,
  `diuresis` int DEFAULT NULL,
  `drenajes` int DEFAULT NULL,
  `sueroLavadorSalida` int DEFAULT NULL,
  `perdidasInsensibles` int DEFAULT NULL,
  `vomitosLiquidos` int DEFAULT NULL,
  `nefrostomiaDerecha` int DEFAULT NULL,
  `nefrostomiaIzquierda` int DEFAULT NULL,
  `ureteralDerecha` int DEFAULT NULL,
  `ureteralIzquierda` int DEFAULT NULL,
  `cistotomia` int DEFAULT NULL,
  `pvc` decimal(5,1) DEFAULT NULL,
  `dolor` int DEFAULT NULL,
  `micciones` int DEFAULT NULL,
  `deposiciones` int DEFAULT NULL,
  `vomitos` int DEFAULT NULL,
  `cambioPostural` int DEFAULT NULL,
  `aspiracionGastrica` int DEFAULT NULL,
  `frecCardiacaAcum` int DEFAULT NULL,
  `eng` varchar(50) DEFAULT NULL,
  `expectoracion` varchar(50) DEFAULT NULL,
  `inr` decimal(5,1) DEFAULT NULL,
  `valoracionIngesta` varchar(50) DEFAULT NULL,
  `fecha_emision` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `id_trabajador` (`id_trabajador`),
  KEY `cama_id` (`cama_id`),
  KEY `historia` (`historia`),
  CONSTRAINT `constantesPaciente_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `constantesPaciente_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `constantesPaciente_ibfk_3` FOREIGN KEY (`id_trabajador`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `constantesPaciente_ibfk_4` FOREIGN KEY (`cama_id`) REFERENCES `Camas` (`cama_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `constantesPaciente_ibfk_5` FOREIGN KEY (`historia`) REFERENCES `Historias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constantesPaciente`
--

LOCK TABLES `constantesPaciente` WRITE;
/*!40000 ALTER TABLE `constantesPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `constantesPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `copiasDeSeguridad`
--

DROP TABLE IF EXISTS `copiasDeSeguridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `copiasDeSeguridad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `copiasDeSeguridad`
--

LOCK TABLES `copiasDeSeguridad` WRITE;
/*!40000 ALTER TABLE `copiasDeSeguridad` DISABLE KEYS */;
/*!40000 ALTER TABLE `copiasDeSeguridad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosticoPaciente`
--

DROP TABLE IF EXISTS `diagnosticoPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosticoPaciente` (
  `id_diagnostico` bigint NOT NULL AUTO_INCREMENT,
  `id_url` varchar(255) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `descripcion` text NOT NULL,
  `diagnosticoEscrito` text,
  `sintomasAsociados` text,
  `pruebasDiagnostico` text,
  `estadoDiagnostico` enum('activo','resuelto','pendiente','no_especificado') NOT NULL,
  `gravedad` enum('leve','moderado','grave','no_especificado') NOT NULL,
  `planTratamiento` text,
  `nombre_medico` varchar(100) NOT NULL,
  `id_medico` binary(16) NOT NULL,
  `id_paciente` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ingreso_id` int NOT NULL,
  PRIMARY KEY (`id_diagnostico`),
  KEY `fk_diagnostico_medico` (`id_medico`),
  KEY `fk_diagnostico_paciente` (`id_paciente`),
  KEY `fk_diagnostico_ingreso` (`ingreso_id`),
  CONSTRAINT `fk_diagnostico_ingreso` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_diagnostico_medico` FOREIGN KEY (`id_medico`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_diagnostico_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosticoPaciente`
--

LOCK TABLES `diagnosticoPaciente` WRITE;
/*!40000 ALTER TABLE `diagnosticoPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosticoPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_hospital`
--

DROP TABLE IF EXISTS `documentos_hospital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_hospital` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `nombre_archivo` varchar(255) NOT NULL,
  `archivo` longblob NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `documento_identificacion` varchar(50) DEFAULT NULL,
  `tipo_documento` enum('cita_previa','consentimiento_paciente','registro_paciente','justificante_paciente','receta_medica') NOT NULL,
  `confirmado` tinyint(1) DEFAULT '0',
  `nombre_paciente` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_hospital`
--

LOCK TABLES `documentos_hospital` WRITE;
/*!40000 ALTER TABLE `documentos_hospital` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_hospital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_hospital_bandeja`
--

DROP TABLE IF EXISTS `documentos_hospital_bandeja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_hospital_bandeja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(50) NOT NULL,
  `documento_identificacion` varchar(20) NOT NULL,
  `nombre_paciente` varchar(100) NOT NULL,
  `campos` longtext NOT NULL,
  `fecha` date NOT NULL,
  `pdfId` varchar(50) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_hospital_bandeja`
--

LOCK TABLES `documentos_hospital_bandeja` WRITE;
/*!40000 ALTER TABLE `documentos_hospital_bandeja` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_hospital_bandeja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `id` binary(16) NOT NULL,
  `hashContraseña` varchar(255) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido1` varchar(50) NOT NULL,
  `apellido2` varchar(50) NOT NULL,
  `rol` enum('medico','enfermero','secretario','administrador','enfermeroEncargado') NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo_electronico` varchar(100) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `departamento` varchar(50) DEFAULT NULL,
  `horario` varchar(50) DEFAULT NULL,
  `numero_seguridad_social` varchar(20) DEFAULT NULL,
  `numero_de_cuenta` varchar(35) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `dni` varchar(50) NOT NULL,
  `especialidad` varchar(50) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo_electronico` (`correo_electronico`),
  KEY `fk_especialidad` (`especialidad`),
  CONSTRAINT `especialidad` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`),
  CONSTRAINT `fk_especialidad` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evolutivoEnfermeria`
--

DROP TABLE IF EXISTS `evolutivoEnfermeria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evolutivoEnfermeria` (
  `evolutivo_id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `historia` int NOT NULL,
  `enfermero_id` binary(16) NOT NULL,
  `nombreTrabajador` varchar(255) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `turno` enum('Mañana','Tarde','Noche') NOT NULL,
  `paciente_nombre_completo` varchar(255) NOT NULL,
  `especialidad` varchar(50) NOT NULL,
  `informacion_evolutivo` text NOT NULL,
  PRIMARY KEY (`evolutivo_id`),
  KEY `enfermero_id` (`enfermero_id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `historia` (`historia`),
  CONSTRAINT `evolutivoEnfermeria_ibfk_1` FOREIGN KEY (`enfermero_id`) REFERENCES `empleados` (`id`),
  CONSTRAINT `evolutivoEnfermeria_ibfk_2` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`),
  CONSTRAINT `evolutivoEnfermeria_ibfk_3` FOREIGN KEY (`historia`) REFERENCES `Historias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evolutivoEnfermeria`
--

LOCK TABLES `evolutivoEnfermeria` WRITE;
/*!40000 ALTER TABLE `evolutivoEnfermeria` DISABLE KEYS */;
/*!40000 ALTER TABLE `evolutivoEnfermeria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evolutivoMedico`
--

DROP TABLE IF EXISTS `evolutivoMedico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evolutivoMedico` (
  `evolutivo_id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `historia` int NOT NULL,
  `medico_id` binary(16) NOT NULL,
  `nombreTrabajador` varchar(255) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `turno` enum('Mañana','Tarde','Noche') NOT NULL,
  `paciente_nombre_completo` varchar(255) NOT NULL,
  `especialidad` varchar(50) NOT NULL,
  `informacion_evolutivo` text NOT NULL,
  PRIMARY KEY (`evolutivo_id`),
  KEY `enfermero_id` (`medico_id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `historia` (`historia`),
  CONSTRAINT `evolutivoMedico_ibfk_1` FOREIGN KEY (`medico_id`) REFERENCES `empleados` (`id`),
  CONSTRAINT `evolutivoMedico_ibfk_2` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`),
  CONSTRAINT `evolutivoMedico_ibfk_3` FOREIGN KEY (`historia`) REFERENCES `Historias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evolutivoMedico`
--

LOCK TABLES `evolutivoMedico` WRITE;
/*!40000 ALTER TABLE `evolutivoMedico` DISABLE KEYS */;
/*!40000 ALTER TABLE `evolutivoMedico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horariosEnfermeria`
--

DROP TABLE IF EXISTS `horariosEnfermeria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horariosEnfermeria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `especialidad` varchar(255) DEFAULT NULL,
  `año` year DEFAULT NULL,
  `mes` enum('Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre') DEFAULT NULL,
  `dia` int DEFAULT NULL,
  `turno` enum('Mañana','Tarde','Noche') DEFAULT NULL,
  `nombre_trabajador` varchar(255) DEFAULT NULL,
  `id_empleado` binary(16) DEFAULT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `especialidad` (`especialidad`),
  KEY `id_empleado` (`id_empleado`),
  CONSTRAINT `horariosEnfermeria_ibfk_1` FOREIGN KEY (`especialidad`) REFERENCES `Especialidad` (`especialidad`),
  CONSTRAINT `horariosEnfermeria_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`),
  CONSTRAINT `horariosEnfermeria_chk_1` CHECK (((`año` >= 2025) and (`año` <= 9999))),
  CONSTRAINT `horariosEnfermeria_chk_2` CHECK (((`dia` >= 1) and (`dia` <= 31)))
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horariosEnfermeria`
--

LOCK TABLES `horariosEnfermeria` WRITE;
/*!40000 ALTER TABLE `horariosEnfermeria` DISABLE KEYS */;
/*!40000 ALTER TABLE `horariosEnfermeria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrosHorarioEnfermeria`
--

DROP TABLE IF EXISTS `registrosHorarioEnfermeria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrosHorarioEnfermeria` (
  `id_registro` int NOT NULL AUTO_INCREMENT,
  `id_turno_solicitado` int NOT NULL,
  `id_turno_a_cambiar` int NOT NULL,
  `id_empleado_receptor` binary(16) NOT NULL,
  `descripcion_turno_solicitado` varchar(100) NOT NULL,
  `nombre_receptor` varchar(255) NOT NULL,
  `id_empleado_solicitante` binary(16) NOT NULL,
  `descripcion_turno_a_cambiar` varchar(100) NOT NULL,
  `nombre_solicitante` varchar(255) NOT NULL,
  `comentario` text,
  `fecha_evento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `contestado` tinyint(1) NOT NULL DEFAULT '0',
  `tipo_solicitud` enum('solicitudCambio','confirmacionCambio','rechazoCambio','anularCambio') DEFAULT NULL,
  PRIMARY KEY (`id_registro`),
  KEY `id_turno_solicitado` (`id_turno_solicitado`),
  KEY `id_turno_a_cambiar` (`id_turno_a_cambiar`),
  KEY `id_empleado_receptor` (`id_empleado_receptor`),
  KEY `id_empleado_solicitante` (`id_empleado_solicitante`),
  CONSTRAINT `registrosHorarioEnfermeria_ibfk_1` FOREIGN KEY (`id_turno_solicitado`) REFERENCES `horariosEnfermeria` (`id`),
  CONSTRAINT `registrosHorarioEnfermeria_ibfk_2` FOREIGN KEY (`id_turno_a_cambiar`) REFERENCES `horariosEnfermeria` (`id`),
  CONSTRAINT `registrosHorarioEnfermeria_ibfk_3` FOREIGN KEY (`id_empleado_receptor`) REFERENCES `empleados` (`id`),
  CONSTRAINT `registrosHorarioEnfermeria_ibfk_4` FOREIGN KEY (`id_empleado_solicitante`) REFERENCES `empleados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrosHorarioEnfermeria`
--

LOCK TABLES `registrosHorarioEnfermeria` WRITE;
/*!40000 ALTER TABLE `registrosHorarioEnfermeria` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrosHorarioEnfermeria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testBarthel`
--

DROP TABLE IF EXISTS `testBarthel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testBarthel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `alimentacion` int NOT NULL,
  `baño` int NOT NULL,
  `aseo_personal` int NOT NULL,
  `vestirse` int NOT NULL,
  `control_intestino` int NOT NULL,
  `control_vejiga` int NOT NULL,
  `uso_inodoro` int NOT NULL,
  `transferencias` int NOT NULL,
  `movilidad` int NOT NULL,
  `subir_escaleras` int NOT NULL,
  `resultado` int NOT NULL,
  `interpretacion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  KEY `idx_ingreso` (`ingreso_id`),
  CONSTRAINT `testBarthel_ibfk_1` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`),
  CONSTRAINT `testBarthel_ibfk_2` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`),
  CONSTRAINT `testBarthel_chk_1` CHECK ((`alimentacion` between 0 and 10)),
  CONSTRAINT `testBarthel_chk_10` CHECK ((`subir_escaleras` between 0 and 10)),
  CONSTRAINT `testBarthel_chk_11` CHECK ((`resultado` between 0 and 100)),
  CONSTRAINT `testBarthel_chk_2` CHECK ((`baño` between 0 and 5)),
  CONSTRAINT `testBarthel_chk_3` CHECK ((`aseo_personal` between 0 and 5)),
  CONSTRAINT `testBarthel_chk_4` CHECK ((`vestirse` between 0 and 10)),
  CONSTRAINT `testBarthel_chk_5` CHECK ((`control_intestino` between 0 and 10)),
  CONSTRAINT `testBarthel_chk_6` CHECK ((`control_vejiga` between 0 and 10)),
  CONSTRAINT `testBarthel_chk_7` CHECK ((`uso_inodoro` between 0 and 10)),
  CONSTRAINT `testBarthel_chk_8` CHECK ((`transferencias` between 0 and 15)),
  CONSTRAINT `testBarthel_chk_9` CHECK ((`movilidad` between 0 and 15))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testBarthel`
--

LOCK TABLES `testBarthel` WRITE;
/*!40000 ALTER TABLE `testBarthel` DISABLE KEYS */;
/*!40000 ALTER TABLE `testBarthel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testBraden`
--

DROP TABLE IF EXISTS `testBraden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testBraden` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `resultado` int NOT NULL,
  `percepcion_sensorial` int NOT NULL,
  `humedad` int NOT NULL,
  `actividad` int NOT NULL,
  `movilidad` int NOT NULL,
  `nutricion` int NOT NULL,
  `friccion_cizallamiento` int NOT NULL,
  `interpretacion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  CONSTRAINT `fk_testBraden_documento_identificacion` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`),
  CONSTRAINT `fk_testBraden_ingreso_id` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testBraden`
--

LOCK TABLES `testBraden` WRITE;
/*!40000 ALTER TABLE `testBraden` DISABLE KEYS */;
/*!40000 ALTER TABLE `testBraden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testDowntown`
--

DROP TABLE IF EXISTS `testDowntown`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testDowntown` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `resultado` int NOT NULL,
  `caidas_previas` int NOT NULL,
  `medicacion` int NOT NULL,
  `deficiencia_sensorial` int NOT NULL,
  `estado_mental` int NOT NULL,
  `capacidad_movilidad` int NOT NULL,
  `interpretacion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  CONSTRAINT `fk_testDowntown_documento_identificacion` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`),
  CONSTRAINT `fk_testDowntown_ingreso_id` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testDowntown`
--

LOCK TABLES `testDowntown` WRITE;
/*!40000 ALTER TABLE `testDowntown` DISABLE KEYS */;
/*!40000 ALTER TABLE `testDowntown` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testEva`
--

DROP TABLE IF EXISTS `testEva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testEva` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `dolor_puntuacion` float NOT NULL,
  `dolor_localizacion` varchar(255) NOT NULL,
  `interpretacion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  CONSTRAINT `fk_testEva_documento_identificacion` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`),
  CONSTRAINT `fk_testEva_ingreso_id` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testEva`
--

LOCK TABLES `testEva` WRITE;
/*!40000 ALTER TABLE `testEva` DISABLE KEYS */;
/*!40000 ALTER TABLE `testEva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testNorton`
--

DROP TABLE IF EXISTS `testNorton`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testNorton` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `resultado` int NOT NULL,
  `interpretacion` varchar(50) NOT NULL,
  `condicion_fisica` int NOT NULL,
  `condicion_mental` int NOT NULL,
  `actividad` int NOT NULL,
  `movilidad` int NOT NULL,
  `incontinencia` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  CONSTRAINT `fk_testNorton_documento_identificacion` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`),
  CONSTRAINT `fk_testNorton_ingreso_id` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testNorton`
--

LOCK TABLES `testNorton` WRITE;
/*!40000 ALTER TABLE `testNorton` DISABLE KEYS */;
/*!40000 ALTER TABLE `testNorton` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testPaciente`
--

DROP TABLE IF EXISTS `testPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testPaciente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_prueba` enum('Barthel','EVA','Downtown','Norton','Braden') NOT NULL,
  `resultado` varchar(10) NOT NULL,
  `interpretacion` varchar(50) NOT NULL,
  `id_del_test` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `ingreso_id` int NOT NULL,
  `id_trabajador` binary(16) DEFAULT NULL,
  `nombreTrabajador` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  KEY `idx_ingreso_fecha` (`ingreso_id`,`fecha_emision`),
  CONSTRAINT `testPaciente_ibfk_1` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`),
  CONSTRAINT `testPaciente_ibfk_2` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testPaciente`
--

LOCK TABLES `testPaciente` WRITE;
/*!40000 ALTER TABLE `testPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `testPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viasDetalles`
--

DROP TABLE IF EXISTS `viasDetalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viasDetalles` (
  `id_via` int NOT NULL AUTO_INCREMENT,
  `fecha_emision` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `tipo_cateter` enum('periferica','central','intermedia') NOT NULL,
  `tamano` varchar(10) NOT NULL,
  `lugar_insercion` varchar(50) NOT NULL,
  `lateralidad` enum('derecha','izquierda') NOT NULL,
  `vena_vaso` varchar(50) NOT NULL,
  `uso_via` varchar(50) DEFAULT NULL,
  `perfusion` varchar(50) DEFAULT NULL,
  `fijacion_cateter` varchar(50) DEFAULT NULL,
  `numero_luces` int DEFAULT NULL,
  `longitud_insercion` decimal(5,1) DEFAULT NULL,
  `marca_cateter` varchar(50) DEFAULT NULL,
  `dolor_asociado` varchar(50) DEFAULT NULL,
  `manejo_dolor` text,
  `accesorios` text,
  `educacion_sanitaria` text,
  `extremidad_dominante` varchar(50) DEFAULT NULL,
  `preparacion_piel` varchar(50) DEFAULT NULL,
  `observaciones` text,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `id_trabajador` binary(16) NOT NULL,
  `nombre_trabajador` varchar(100) NOT NULL,
  PRIMARY KEY (`id_via`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  CONSTRAINT `viasDetalles_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`),
  CONSTRAINT `viasDetalles_ibfk_2` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viasDetalles`
--

LOCK TABLES `viasDetalles` WRITE;
/*!40000 ALTER TABLE `viasDetalles` DISABLE KEYS */;
/*!40000 ALTER TABLE `viasDetalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viasMantenimiento`
--

DROP TABLE IF EXISTS `viasMantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viasMantenimiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enfermero` varchar(100) NOT NULL,
  `fecha_mantenimiento` datetime NOT NULL,
  `actuacion` text NOT NULL,
  `complicaciones` text,
  `observaciones` text,
  `escala_maddox` tinyint unsigned NOT NULL,
  `ingreso_id` int NOT NULL,
  `paciente_id` varchar(20) NOT NULL,
  `id_trabajador` binary(16) NOT NULL,
  `nombre_trabajador` varchar(100) NOT NULL,
  `id_via` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `id_trabajador` (`id_trabajador`),
  KEY `id_via` (`id_via`),
  CONSTRAINT `viasMantenimiento_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `viasMantenimiento_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `viasMantenimiento_ibfk_3` FOREIGN KEY (`id_trabajador`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `viasMantenimiento_ibfk_4` FOREIGN KEY (`id_via`) REFERENCES `viasDetalles` (`id_via`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viasMantenimiento`
--

LOCK TABLES `viasMantenimiento` WRITE;
/*!40000 ALTER TABLE `viasMantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `viasMantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viasPaciente`
--

DROP TABLE IF EXISTS `viasPaciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viasPaciente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_via` int NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `tipo_via` enum('periferica','central','intermedia') NOT NULL,
  `descripcion` text NOT NULL,
  `ingreso_id` int NOT NULL,
  `documento_identificacion` varchar(50) NOT NULL,
  `id_trabajador` binary(16) NOT NULL,
  `nombre_trabajador` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_via` (`id_via`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `documento_identificacion` (`documento_identificacion`),
  CONSTRAINT `viasPaciente_ibfk_1` FOREIGN KEY (`id_via`) REFERENCES `viasDetalles` (`id_via`) ON DELETE CASCADE,
  CONSTRAINT `viasPaciente_ibfk_2` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`),
  CONSTRAINT `viasPaciente_ibfk_3` FOREIGN KEY (`documento_identificacion`) REFERENCES `Pacientes` (`documento_identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viasPaciente`
--

LOCK TABLES `viasPaciente` WRITE;
/*!40000 ALTER TABLE `viasPaciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `viasPaciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viasRetirada`
--

DROP TABLE IF EXISTS `viasRetirada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viasRetirada` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enfermero` varchar(100) NOT NULL,
  `fecha_retirada` datetime NOT NULL,
  `motivo` text NOT NULL,
  `cultivos` varchar(10) DEFAULT NULL,
  `observaciones` text,
  `ingreso_id` int NOT NULL,
  `paciente_id` varchar(20) NOT NULL,
  `id_trabajador` binary(16) NOT NULL,
  `id_via` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingreso_id` (`ingreso_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `id_trabajador` (`id_trabajador`),
  KEY `id_via` (`id_via`),
  CONSTRAINT `viasRetirada_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `Ingresados` (`ingreso_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `viasRetirada_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`documento_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `viasRetirada_ibfk_3` FOREIGN KEY (`id_trabajador`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `viasRetirada_ibfk_4` FOREIGN KEY (`id_via`) REFERENCES `viasDetalles` (`id_via`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viasRetirada`
--

LOCK TABLES `viasRetirada` WRITE;
/*!40000 ALTER TABLE `viasRetirada` DISABLE KEYS */;
/*!40000 ALTER TABLE `viasRetirada` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-30  0:00:00
