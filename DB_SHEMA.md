## Table `activities`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `deal_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `organization_id` | `uuid` |  |
| `type` | `text` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `due_date` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `is_completed` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `annotation_tag_entity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `app_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `code` | `text` | Primary |
| `name` | `text` |  |
| `module` | `text` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `app_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `is_system` | `bool` |  Nullable |
| `color` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `assignment_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `assignment_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |

## Table `audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `table_name` | `text` |  |
| `record_id` | `uuid` |  |
| `operation` | `text` |  |
| `old_data` | `jsonb` |  Nullable |
| `new_data` | `jsonb` |  Nullable |
| `changed_by` | `uuid` |  Nullable |
| `changed_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  |

## Table `auth_identity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `userId` | `uuid` |  Nullable |
| `providerId` | `varchar` | Primary |
| `providerType` | `varchar` | Primary |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `auth_provider_sync_history`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `providerType` | `varchar` |  |
| `runMode` | `text` |  |
| `status` | `text` |  |
| `startedAt` | `timestamptz` |  |
| `endedAt` | `timestamptz` |  |
| `scanned` | `int4` |  |
| `created` | `int4` |  |
| `updated` | `int4` |  |
| `disabled` | `int4` |  |
| `error` | `text` |  Nullable |

## Table `bank_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `bank_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |
| `updated_at` | `timestamptz` |  |
| `min_stock_alert` | `int4` |  Nullable |

## Table `billing_plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `tier` | `text` |  Unique |
| `is_active` | `bool` |  Nullable |
| `features` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `billing_prices`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `plan_id` | `uuid` |  Nullable |
| `amount` | `numeric` |  |
| `currency` | `text` |  Nullable |
| `interval` | `text` |  Nullable |
| `provider_price_id` | `text` |  Nullable |
| `paypal_plan_id` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `billing_transactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `subscription_id` | `uuid` |  Nullable |
| `amount` | `numeric` |  |
| `currency` | `text` |  Nullable |
| `status` | `text` |  |
| `provider` | `text` |  |
| `provider_transaction_id` | `text` |  Nullable |
| `payment_method_type` | `text` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `binary_data`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `fileId` | `uuid` | Primary |
| `sourceType` | `varchar` |  |
| `sourceId` | `varchar` |  |
| `data` | `bytea` |  |
| `mimeType` | `varchar` |  Nullable |
| `fileName` | `varchar` |  Nullable |
| `fileSize` | `int4` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `chat_hub_agent_tools`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `agentId` | `uuid` | Primary |
| `toolId` | `uuid` | Primary |

## Table `chat_hub_agents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `description` | `varchar` |  Nullable |
| `systemPrompt` | `text` |  |
| `ownerId` | `uuid` |  |
| `credentialId` | `varchar` |  Nullable |
| `provider` | `varchar` |  |
| `model` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `icon` | `json` |  Nullable |
| `files` | `json` |  |
| `suggestedPrompts` | `json` |  |

## Table `chat_hub_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sessionId` | `uuid` |  |
| `previousMessageId` | `uuid` |  Nullable |
| `revisionOfMessageId` | `uuid` |  Nullable |
| `retryOfMessageId` | `uuid` |  Nullable |
| `type` | `varchar` |  |
| `name` | `varchar` |  |
| `content` | `text` |  |
| `provider` | `varchar` |  Nullable |
| `model` | `varchar` |  Nullable |
| `workflowId` | `varchar` |  Nullable |
| `executionId` | `int4` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `agentId` | `uuid` |  Nullable |
| `status` | `varchar` |  |
| `attachments` | `json` |  Nullable |

## Table `chat_hub_session_tools`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `sessionId` | `uuid` | Primary |
| `toolId` | `uuid` | Primary |

## Table `chat_hub_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `varchar` |  |
| `ownerId` | `uuid` |  |
| `lastMessageAt` | `timestamptz` |  |
| `credentialId` | `varchar` |  Nullable |
| `provider` | `varchar` |  Nullable |
| `model` | `varchar` |  Nullable |
| `workflowId` | `varchar` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `agentId` | `uuid` |  Nullable |
| `agentName` | `varchar` |  Nullable |
| `type` | `varchar` |  |

## Table `chat_hub_tools`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `type` | `varchar` |  |
| `typeVersion` | `float8` |  |
| `ownerId` | `uuid` |  |
| `definition` | `json` |  |
| `enabled` | `bool` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `commerces`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `rif` | `text` |  Nullable |
| `owner_name` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `contact_type` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `potential` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `region` | `text` |  Nullable |

## Table `commercial_offers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `min_quantity` | `int4` |  |
| `bonus_quantity` | `int4` |  Nullable |
| `discount_percentage` | `numeric` |  Nullable |
| `active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `companies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `compensation_policies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `base_salary` | `numeric` |  Nullable |
| `food_stamps` | `numeric` |  Nullable |
| `vehicle_support` | `numeric` |  Nullable |
| `sales_threshold` | `int4` |  Nullable |
| `commission_rate` | `numeric` |  Nullable |
| `papeleta_conversion_factor` | `int4` |  Nullable |
| `daily_no_stay_amount` | `numeric` |  Nullable |
| `daily_with_stay_amount` | `numeric` |  Nullable |
| `fuel_autonomy_factor` | `numeric` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `contact_health_centers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `contact_id` | `uuid` |  |
| `health_center_id` | `uuid` |  |
| `schedule` | `text` |  Nullable |
| `is_primary` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  |
| `organization_id` | `uuid` |  Nullable |

## Table `contacts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `contact_type` | `contact_type` |  |
| `specialty` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `work_hours` | `text` |  Nullable |
| `priority` | `priority_level` |  Nullable |
| `notes` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `company_id` | `uuid` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `state` | `text` |  Nullable |
| `region` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `visit_count` | `int4` |  Nullable |
| `last_visit` | `date` |  Nullable |
| `rif` | `text` |  Nullable |
| `owner_name` | `text` |  Nullable |
| `sanitary_permits` | `bool` |  Nullable |
| `potential` | `text` |  Nullable |

## Table `credential_dependency`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `credentialId` | `varchar` |  |
| `dependencyType` | `varchar` |  |
| `dependencyId` | `varchar` |  |
| `createdAt` | `timestamptz` |  |

## Table `credentials_entity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `varchar` |  |
| `data` | `text` |  |
| `type` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `id` | `varchar` | Primary |
| `isManaged` | `bool` |  |
| `isGlobal` | `bool` |  |
| `isResolvable` | `bool` |  |
| `resolvableAllowFallback` | `bool` |  |
| `resolverId` | `varchar` |  Nullable |

## Table `cycles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `start_date` | `date` |  |
| `end_date` | `date` |  |
| `status` | `text` |  Nullable |
| `goals_json` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `daily_plan_details`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `weekly_plan_id` | `uuid` |  |
| `day_of_week` | `text` |  |
| `date` | `date` |  |
| `directory_item_id` | `uuid` |  |
| `turn` | `text` |  Nullable |
| `visit_order` | `int4` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `daily_plan_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `plan_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  |
| `visit_id` | `uuid` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `scheduled_time` | `time` |  Nullable |
| `duration_minutes` | `int4` |  Nullable |
| `priority` | `int4` |  Nullable |
| `status` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `daily_plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `plan_date` | `date` |  |
| `title` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `data_table`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `projectId` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `data_table_column`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `type` | `varchar` |  |
| `index` | `int4` |  |
| `dataTableId` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `deals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `organization_id` | `uuid` |  |
| `zone_id` | `uuid` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `value` | `numeric` |  Nullable |
| `currency` | `text` |  Nullable |
| `stage` | `text` |  |
| `probability` | `int4` |  Nullable |
| `expected_close_date` | `date` |  Nullable |
| `source` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `lost_reason` | `text` |  Nullable |
| `won_date` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `debug_auth_dump`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` |  Nullable |
| `instance_id` | `uuid` |  Nullable |
| `aud` | `varchar` |  Nullable |
| `role` | `varchar` |  Nullable |
| `email` | `varchar` |  Nullable |
| `email_confirmed_at` | `timestamptz` |  Nullable |
| `last_sign_in_at` | `timestamptz` |  Nullable |
| `raw_user_meta_data` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `is_sso_user` | `bool` |  Nullable |

## Table `debug_roles_dump`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `company_id` | `uuid` |  Nullable |
| `role` | `text` |  Nullable |
| `permissions` | `jsonb` |  Nullable |
| `territory` | `text` |  Nullable |
| `supervisor_id` | `uuid` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `zone_id` | `uuid` |  Nullable |

## Table `debug_triggers_dump`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `event_object_schema` | `name` |  Nullable |
| `event_object_table` | `name` |  Nullable |
| `trigger_name` | `name` |  Nullable |
| `action_statement` | `varchar` |  Nullable |
| `action_timing` | `varchar` |  Nullable |

## Table `detalle_entrega_banco`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `entrega_banco_id` | `uuid` |  |
| `stock_muestra_id` | `uuid` |  |
| `cantidad_inicial` | `int4` |  |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `directory_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `entity_id` | `uuid` |  |
| `entity_type` | `text` |  |
| `name` | `text` |  |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `dispensacion_muestras`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `inventario_banco_id` | `uuid` |  |
| `fecha_dispensacion` | `date` |  |
| `cantidad_dispensada` | `int4` |  |
| `entregado_a` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `dispensacion_pacientes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `health_center_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `lote` | `text` |  Nullable |
| `fecha_vencimiento` | `date` |  Nullable |
| `nombre_paciente` | `text` |  |
| `cedula` | `text` |  Nullable |
| `telefono` | `text` |  Nullable |
| `diagnostico` | `text` |  Nullable |
| `fecha_dispensacion` | `date` |  |
| `cantidad_dispensada` | `int4` |  |
| `dispensado_por` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `distributors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `doctor_schedules`

Multiple locations and schedules for each doctor

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `doctor_id` | `uuid` |  |
| `health_center_id` | `uuid` |  Nullable |
| `direccion` | `text` |  Nullable |
| `zona_sector` | `text` |  Nullable |
| `ciudad` | `text` |  Nullable |
| `estado` | `text` |  Nullable |
| `dias_atencion` | `text` |  |
| `hora_inicio` | `time` |  |
| `hora_fin` | `time` |  |
| `activo` | `bool` |  Nullable |
| `notas` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `doctor_scores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `contact_id` | `uuid` |  Nullable Unique |
| `total_visits` | `int4` |  Nullable |
| `visits_last_30_days` | `int4` |  Nullable |
| `visits_last_90_days` | `int4` |  Nullable |
| `samples_received` | `int4` |  Nullable |
| `products_presented` | `int4` |  Nullable |
| `avg_visit_duration_minutes` | `numeric` |  Nullable |
| `score_value` | `numeric` |  Nullable |
| `score_category` | `varchar` |  Nullable |
| `ideal_visit_frequency_days` | `int4` |  Nullable |
| `days_since_last_visit` | `int4` |  Nullable |
| `visit_gap_status` | `varchar` |  Nullable |
| `last_visit_date` | `timestamptz` |  Nullable |
| `last_calculated_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `doctors`

Tabla de médicos con información completa profesional y de contacto

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `representative_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `birth_date` | `date` |  Nullable |
| `phone` | `text` |  Nullable |
| `mobile` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `specialty` | `text` |  Nullable |
| `msds` | `text` |  Nullable |
| `cm` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `health_center` | `text` |  Nullable |
| `days` | `text` |  Nullable |
| `start_time` | `time` |  Nullable |
| `end_time` | `time` |  Nullable |
| `potential` | `text` |  Nullable |
| `observations` | `text` |  Nullable |
| `last_visit` | `date` |  Nullable |
| `status` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `specialty_id` | `uuid` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `lat` | `float8` |  Nullable |
| `lng` | `float8` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `visit_count` | `int4` |  Nullable |
| `priority` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `region` | `text` |  Nullable |

## Table `drugstores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `code` | `text` |  Nullable |
| `contact_name` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `type` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `priority` | `text` |  Nullable |
| `potential` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `rif` | `text` |  Nullable |
| `owner_name` | `text` |  Nullable |
| `sanitary_permits` | `bool` |  Nullable |
| `region` | `text` |  Nullable |

## Table `dynamic_credential_entry`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `credential_id` | `varchar` | Primary |
| `subject_id` | `varchar` | Primary |
| `resolver_id` | `varchar` | Primary |
| `data` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `dynamic_credential_resolver`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `type` | `varchar` |  |
| `config` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `dynamic_credential_user_entry`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `credentialId` | `varchar` | Primary |
| `userId` | `uuid` | Primary |
| `resolverId` | `varchar` | Primary |
| `data` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `entrega_muestras`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `visit_id` | `uuid` |  Nullable |
| `stock_muestra_id` | `uuid` |  |
| `doctor_id` | `uuid` |  Nullable |
| `cantidad_entregada` | `int4` |  |
| `fecha_entrega` | `date` |  |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `entregas_banco`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `health_center_id` | `uuid` |  Nullable |
| `servicio` | `text` |  Nullable |
| `jefe_servicio` | `text` |  Nullable |
| `fecha_entrega` | `date` |  |
| `entregado_por` | `text` |  Nullable |
| `foto_acta_url` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `event_destinations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `destination` | `jsonb` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `event_type` | `text` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `location` | `text` |  Nullable |
| `scheduled_date` | `timestamptz` |  |
| `end_date` | `timestamptz` |  Nullable |
| `status` | `text` |  Nullable |
| `attendees_count` | `int4` |  Nullable |
| `notes` | `text` |  Nullable |
| `materials_used` | `_text` |  Nullable |
| `products_presented` | `_uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `execution_annotation_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `annotationId` | `int4` | Primary |
| `tagId` | `varchar` | Primary |

## Table `execution_annotations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `executionId` | `int4` |  |
| `vote` | `varchar` |  Nullable |
| `note` | `text` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `execution_data`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `executionId` | `int4` | Primary |
| `workflowData` | `json` |  |
| `data` | `text` |  |
| `workflowVersionId` | `varchar` |  Nullable |

## Table `execution_entity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `finished` | `bool` |  |
| `mode` | `varchar` |  |
| `retryOf` | `varchar` |  Nullable |
| `retrySuccessId` | `varchar` |  Nullable |
| `startedAt` | `timestamptz` |  Nullable |
| `stoppedAt` | `timestamptz` |  Nullable |
| `waitTill` | `timestamptz` |  Nullable |
| `status` | `varchar` |  |
| `workflowId` | `varchar` |  |
| `deletedAt` | `timestamptz` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `storedAt` | `varchar` |  |

## Table `execution_metadata`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `executionId` | `int4` |  |
| `key` | `varchar` |  |
| `value` | `text` |  |

## Table `expense_budgets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  Nullable |
| `category` | `text` |  |
| `budget_amount` | `numeric` |  |
| `period_type` | `text` |  Nullable |
| `period_start` | `date` |  |
| `period_end` | `date` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `expense_reports`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `week_start_date` | `date` |  |
| `start_km` | `int4` |  |
| `end_km` | `int4` |  |
| `start_km_photo_url` | `text` |  Nullable |
| `end_km_photo_url` | `text` |  Nullable |
| `pernocta_days` | `int4` |  Nullable |
| `no_pernocta_days` | `int4` |  Nullable |
| `status` | `text` |  Nullable |
| `total_reimbursement` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `expenses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  Nullable |
| `category` | `text` |  |
| `subcategory` | `text` |  Nullable |
| `amount` | `numeric` |  |
| `currency` | `text` |  Nullable |
| `expense_date` | `date` |  |
| `description` | `text` |  Nullable |
| `vendor` | `text` |  Nullable |
| `receipt_url` | `text` |  Nullable |
| `visit_id` | `uuid` |  Nullable |
| `status` | `text` |  Nullable |
| `approved_by` | `uuid` |  Nullable |
| `approved_at` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `start_km` | `float8` |  Nullable |
| `end_km` | `float8` |  Nullable |
| `km_start_url` | `text` |  Nullable |
| `km_end_url` | `text` |  Nullable |
| `custom_category` | `text` |  Nullable |

## Table `field_evaluations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `visit_id` | `uuid` |  Nullable |
| `supervisor_id` | `uuid` |  |
| `representative_id` | `uuid` |  |
| `score_vademecum` | `int4` |  Nullable |
| `score_objection_handling` | `int4` |  Nullable |
| `score_closing_skills` | `int4` |  Nullable |
| `score_pre_call_planning` | `int4` |  Nullable |
| `score_sample_strategy` | `bool` |  Nullable |
| `strengths` | `text` |  Nullable |
| `areas_for_improvement` | `text` |  Nullable |
| `action_plan` | `text` |  Nullable |
| `evaluation_date` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `fixed_assets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `code` | `text` |  Unique |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `assigned_to` | `uuid` |  Nullable |
| `condition` | `text` |  Nullable |
| `assigned_date` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `folder`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `parentFolderId` | `varchar` |  Nullable |
| `projectId` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `folder_tag`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `folderId` | `varchar` | Primary |
| `tagId` | `varchar` | Primary |

## Table `health_centers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `facility_type` | `text` |  |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `zone_id` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `potential` | `text` |  Nullable |
| `last_visit` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `lat` | `float8` |  Nullable |
| `lng` | `float8` |  Nullable |
| `visit_count` | `int4` |  Nullable |
| `priority` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `region` | `text` |  Nullable |

## Table `help_articles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `content` | `text` |  |
| `category` | `text` |  |
| `subcategory` | `text` |  Nullable |
| `order_index` | `int4` |  Nullable |
| `is_published` | `bool` |  Nullable |
| `views_count` | `int4` |  Nullable |
| `helpful_count` | `int4` |  Nullable |
| `not_helpful_count` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `insights_by_period`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `metaId` | `int4` |  |
| `type` | `int4` |  |
| `value` | `int8` |  |
| `periodUnit` | `int4` |  |
| `periodStart` | `timestamptz` |  Nullable |

## Table `insights_metadata`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `metaId` | `int4` | Primary Identity |
| `workflowId` | `varchar` |  Nullable |
| `projectId` | `varchar` |  Nullable |
| `workflowName` | `varchar` |  |
| `projectName` | `varchar` |  |

## Table `insights_raw`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `metaId` | `int4` |  |
| `type` | `int4` |  |
| `value` | `int8` |  |
| `timestamp` | `timestamptz` |  |

## Table `installed_nodes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `varchar` | Primary |
| `type` | `varchar` |  |
| `latestVersion` | `int4` |  |
| `package` | `varchar` |  |

## Table `installed_packages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `packageName` | `varchar` | Primary |
| `installedVersion` | `varchar` |  |
| `authorName` | `varchar` |  Nullable |
| `authorEmail` | `varchar` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_iteration_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `threadId` | `uuid` |  |
| `taskKey` | `varchar` |  |
| `entry` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `threadId` | `uuid` |  |
| `content` | `text` |  |
| `role` | `varchar` |  |
| `type` | `varchar` |  Nullable |
| `resourceId` | `varchar` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_observational_memory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `lookupKey` | `varchar` |  |
| `scope` | `varchar` |  |
| `threadId` | `uuid` |  Nullable |
| `resourceId` | `varchar` |  |
| `activeObservations` | `text` |  |
| `originType` | `varchar` |  |
| `config` | `text` |  |
| `generationCount` | `int4` |  |
| `lastObservedAt` | `timestamptz` |  Nullable |
| `pendingMessageTokens` | `int4` |  |
| `totalTokensObserved` | `int4` |  |
| `observationTokenCount` | `int4` |  |
| `isObserving` | `bool` |  |
| `isReflecting` | `bool` |  |
| `observedMessageIds` | `json` |  Nullable |
| `observedTimezone` | `varchar` |  Nullable |
| `bufferedObservations` | `text` |  Nullable |
| `bufferedObservationTokens` | `int4` |  Nullable |
| `bufferedMessageIds` | `json` |  Nullable |
| `bufferedReflection` | `text` |  Nullable |
| `bufferedReflectionTokens` | `int4` |  Nullable |
| `bufferedReflectionInputTokens` | `int4` |  Nullable |
| `reflectedObservationLineCount` | `int4` |  Nullable |
| `bufferedObservationChunks` | `json` |  Nullable |
| `isBufferingObservation` | `bool` |  |
| `isBufferingReflection` | `bool` |  |
| `lastBufferedAtTokens` | `int4` |  |
| `lastBufferedAtTime` | `timestamptz` |  Nullable |
| `metadata` | `json` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_resources`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `workingMemory` | `text` |  Nullable |
| `metadata` | `json` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_run_snapshots`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `threadId` | `uuid` | Primary |
| `runId` | `varchar` | Primary |
| `messageGroupId` | `varchar` |  Nullable |
| `runIds` | `json` |  Nullable |
| `tree` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_threads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `resourceId` | `varchar` |  |
| `title` | `text` |  |
| `metadata` | `json` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_ai_workflow_snapshots`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `runId` | `varchar` | Primary |
| `workflowName` | `varchar` | Primary |
| `resourceId` | `varchar` |  Nullable |
| `status` | `varchar` |  Nullable |
| `snapshot` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `instance_version_history`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `major` | `int4` |  |
| `minor` | `int4` |  |
| `patch` | `int4` |  |
| `createdAt` | `timestamptz` |  |

## Table `invalid_auth_token`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `token` | `varchar` | Primary |
| `expiresAt` | `timestamptz` |  |

## Table `inventario_droguerias`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `drogueria_id` | `uuid` |  |
| `producto_id` | `uuid` |  |
| `cantidad` | `int4` |  |
| `precio_venta_farmacia` | `numeric` |  |
| `updated_at` | `timestamptz` |  |

## Table `inventario_muestras`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  Nullable |
| `lote` | `text` |  |
| `fecha_fabricacion` | `date` |  Nullable |
| `fecha_vencimiento` | `date` |  |
| `cantidad_asignada` | `int4` |  |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `inventory_movements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity_change` | `int4` |  |
| `movement_type` | `text` |  |
| `contact_id` | `uuid` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `invoices`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `amount` | `numeric` |  |
| `currency` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `due_date` | `timestamptz` |  Nullable |
| `paid_at` | `timestamptz` |  Nullable |
| `invoice_number` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `lista_precios_biofarco`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `producto_id` | `uuid` |  Unique |
| `precio_base` | `numeric` |  |
| `updated_at` | `timestamptz` |  |

## Table `market_share_data`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `product_category` | `text` |  |
| `period_date` | `date` |  |
| `our_market_share` | `numeric` |  Nullable |
| `competitor_market_share` | `numeric` |  Nullable |
| `total_market_value` | `numeric` |  Nullable |
| `source` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `master_audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `master_id` | `uuid` |  Nullable |
| `action_type` | `text` |  |
| `target_id` | `uuid` |  Nullable |
| `details` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `master_users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  Unique |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `user_id` | `uuid` |  Nullable |

## Table `materiales_promocionales`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `tipo` | `text` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `cantidad_disponible` | `int4` |  |
| `cantidad_inicial` | `int4` |  |
| `fecha_recepcion` | `date` |  Nullable |
| `notas` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `migrations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `timestamp` | `int8` |  |
| `name` | `varchar` |  |

## Table `natural_stores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `rif` | `text` |  Nullable |
| `owner_name` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `contact_type` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `potential` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `region` | `text` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `message` | `text` |  |
| `notification_type` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `is_read` | `bool` |  Nullable |
| `read_at` | `timestamptz` |  Nullable |
| `action_url` | `text` |  Nullable |
| `action_label` | `text` |  Nullable |
| `reference_type` | `text` |  Nullable |
| `reference_id` | `uuid` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `oauth_access_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `token` | `varchar` | Primary |
| `clientId` | `varchar` |  |
| `userId` | `uuid` |  |

## Table `oauth_authorization_codes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `code` | `varchar` | Primary |
| `clientId` | `varchar` |  |
| `userId` | `uuid` |  |
| `redirectUri` | `varchar` |  |
| `codeChallenge` | `varchar` |  |
| `codeChallengeMethod` | `varchar` |  |
| `expiresAt` | `int8` |  |
| `state` | `varchar` |  Nullable |
| `used` | `bool` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `oauth_clients`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `redirectUris` | `json` |  |
| `grantTypes` | `json` |  |
| `clientSecret` | `varchar` |  Nullable |
| `clientSecretExpiresAt` | `int8` |  Nullable |
| `tokenEndpointAuthMethod` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `oauth_refresh_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `token` | `varchar` | Primary |
| `clientId` | `varchar` |  |
| `userId` | `uuid` |  |
| `expiresAt` | `int8` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `oauth_user_consents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `userId` | `uuid` |  |
| `clientId` | `varchar` |  |
| `grantedAt` | `int8` |  |

## Table `objectives`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `objective_type` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `target_value` | `numeric` |  |
| `current_value` | `numeric` |  Nullable |
| `unit` | `text` |  Nullable |
| `start_date` | `date` |  |
| `end_date` | `date` |  |
| `status` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `organizations`

Multi-tenant organization/company table

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `logo_url` | `text` |  Nullable |
| `plan_tier` | `text` |  Nullable |
| `subscription_status` | `text` |  Nullable |
| `stripe_customer_id` | `text` |  Nullable |
| `stripe_subscription_id` | `text` |  Nullable |
| `trial_ends_at` | `timestamptz` |  Nullable |
| `settings` | `jsonb` |  Nullable |
| `onboarding_completed` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `rif` | `text` |  Nullable |
| `fiscal_address` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `taxpayer_type` | `text` |  Nullable |
| `fiscal_name` | `text` |  Nullable |
| `is_system_owner` | `bool` |  Nullable |

## Table `payment_reports`

SaaS Payment Reports - Optimized for PostgREST joins

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `organization_id` | `uuid` |  |
| `plan_id` | `uuid` |  |
| `payment_method` | `text` |  |
| `reference_number` | `text` |  |
| `amount_paid` | `numeric` |  |
| `proof_image_url` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `admin_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `pharmacies`

Tabla de farmacias con campos específicos del negocio

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `zone_id` | `uuid` |  Nullable |
| `representative_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `rif` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `sector` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `contact_phone` | `text` |  Nullable |
| `contact_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `main_contact` | `text` |  Nullable |
| `contact_position` | `text` |  Nullable |
| `schedule` | `text` |  Nullable |
| `business_hours` | `text` |  Nullable |
| `promoted_products` | `_text` |  Nullable |
| `product_interest` | `text` |  Nullable |
| `segmentation` | `text` |  Nullable |
| `potential` | `text` |  Nullable |
| `follow_up_action` | `text` |  Nullable |
| `last_visit` | `date` |  Nullable |
| `status` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `region` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `lat` | `float8` |  Nullable |
| `lng` | `float8` |  Nullable |
| `visit_count` | `int4` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |

## Table `pharmacy_drugstore_relations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `pharmacy_id` | `uuid` |  Nullable |
| `drugstore_id` | `uuid` |  Nullable |
| `account_number` | `text` |  Nullable |
| `is_preferred` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `pharmacy_reports`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `pharmacy_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `pharmacy_scores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `pharmacy_id` | `uuid` | Primary |
| `score` | `int4` |  Nullable |
| `level` | `text` |  Nullable |
| `last_updated` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `pharmacy_stock`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `pharmacy_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `quantity` | `int4` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `pharmacy_trainings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `visit_id` | `uuid` |  Nullable |
| `pharmacy_id` | `uuid` |  |
| `topics` | `_text` |  |
| `attendees_count` | `int4` |  Nullable |
| `evidence_photo_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `created_by` | `uuid` |  Nullable |

## Table `pop_assignment_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `assignment_id` | `uuid` |  Nullable |
| `material_id` | `uuid` |  Nullable |
| `quantity` | `int4` |  |

## Table `pop_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_by` | `uuid` |  Nullable |
| `representative_id` | `uuid` |  Nullable |
| `status` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `pop_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `category` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `sku` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `processed_data`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `workflowId` | `varchar` | Primary |
| `context` | `varchar` | Primary |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `value` | `text` |  |

## Table `product_assets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  Nullable |
| `type` | `text` |  |
| `url` | `text` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `order_index` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `display_order` | `int4` |  Nullable |

## Table `product_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  Nullable |
| `last_updated` | `timestamptz` |  Nullable |

## Table `product_specialties`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  Nullable |
| `specialty` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `products`

Pharmaceutical products catalog with complete medical information

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `therapeutic_area` | `text` |  Nullable |
| `dosage` | `text` |  Nullable |
| `presentation` | `text` |  Nullable |
| `active_ingredients` | `_text` |  Nullable |
| `indications` | `text` |  Nullable |
| `contraindications` | `text` |  Nullable |
| `side_effects` | `text` |  Nullable |
| `price` | `numeric` |  Nullable |
| `image_url` | `text` |  Nullable |
| `document_urls` | `_text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `company_id` | `uuid` |  Nullable |
| `product_code` | `text` |  Nullable Unique |
| `medical_specialties` | `text` |  Nullable |
| `key_message` | `text` |  Nullable |
| `safety_info` | `text` |  Nullable |
| `pdf_link` | `text` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `composition` | `text` |  Nullable |
| `clinical_evidence` | `text` |  Nullable |
| `posology` | `text` |  Nullable |
| `selling_points` | `text` |  Nullable |
| `profitability_info` | `text` |  Nullable |
| `sales_tips` | `text` |  Nullable |
| `objection_handling` | `text` |  Nullable |
| `sku` | `text` |  Nullable |
| `price_cobeca` | `numeric` |  Nullable |
| `price_dronena` | `numeric` |  Nullable |
| `dosage_config` | `jsonb` |  Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Unique |
| `first_name` | `text` |  |
| `last_name` | `text` |  |
| `employee_id` | `text` |  Nullable Unique |
| `territory` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `company_id` | `uuid` |  Nullable |
| `position` | `text` |  Nullable |
| `bio` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `is_org_admin` | `bool` |  Nullable |
| `state` | `text` |  Nullable |
| `region` | `text` |  Nullable |
| `invitation_status` | `text` |  Nullable |
| `has_completed_onboarding` | `bool` |  Nullable |
| `is_master` | `bool` |  Nullable |

## Table `project`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `type` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `icon` | `json` |  Nullable |
| `description` | `varchar` |  Nullable |
| `creatorId` | `uuid` |  Nullable |

## Table `project_relation`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `projectId` | `varchar` | Primary |
| `userId` | `uuid` | Primary |
| `role` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `project_secrets_provider_access`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `secretsProviderConnectionId` | `int4` | Primary |
| `projectId` | `varchar` | Primary |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `role` | `varchar` |  |

## Table `promotional_cycle_products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `cycle_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `target_presentations` | `int4` |  Nullable |
| `target_samples` | `int4` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `promotional_cycles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `description` | `text` |  Nullable |
| `start_date` | `date` |  |
| `end_date` | `date` |  |
| `status` | `varchar` |  Nullable |
| `objectives` | `text` |  Nullable |
| `target_visits` | `int4` |  Nullable |
| `target_presentations` | `int4` |  Nullable |
| `target_samples` | `int4` |  Nullable |
| `current_visits` | `int4` |  Nullable |
| `current_presentations` | `int4` |  Nullable |
| `current_samples` | `int4` |  Nullable |
| `company_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `promotional_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `type` | `text` |  |
| `product_id` | `uuid` |  Nullable |
| `file_url` | `text` |  Nullable |
| `file_size` | `int4` |  Nullable |
| `file_type` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `quote_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `quote_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `quantity` | `int4` |  |
| `unit_price` | `numeric` |  |
| `discount` | `numeric` |  Nullable |
| `total` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `quotes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `pharmacy_name` | `text` |  Nullable |
| `total_amount` | `numeric` |  Nullable |
| `status` | `text` |  Nullable |
| `valid_until` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `registro_pvp_farmacia`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `visit_id` | `uuid` |  Nullable |
| `producto_id` | `uuid` |  |
| `tiene_stock` | `bool` |  Nullable |
| `pvp` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  |
| `cantidad_actual` | `int4` |  Nullable |
| `cantidad_anterior` | `int4` |  Nullable |
| `ventas_estimadas` | `int4` |  Nullable |
| `pharmacy_id` | `uuid` |  Nullable |
| `faces` | `numeric` |  Nullable |

## Table `rep_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |
| `updated_at` | `timestamptz` |  |

## Table `rep_stats_summary`

Pre-calculated statistics for sales representatives, updated via triggers

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `total_sales` | `numeric` |  Nullable |
| `total_visits` | `int4` |  Nullable |
| `total_orders` | `int4` |  Nullable |
| `effectiveness` | `numeric` |  Nullable |
| `last_updated` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `reposiciones_banco`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `detalle_entrega_id` | `uuid` |  |
| `stock_muestra_id` | `uuid` |  |
| `cantidad_repuesta` | `int4` |  |
| `fecha_reposicion` | `date` |  |
| `usuario_reposicion` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `role`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `slug` | `varchar` | Primary |
| `displayName` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `roleType` | `text` |  Nullable |
| `systemRole` | `bool` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `role_mapping_rule`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `expression` | `text` |  |
| `role` | `varchar` |  |
| `type` | `varchar` |  |
| `order` | `int4` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `role_mapping_rule_project`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `roleMappingRuleId` | `varchar` | Primary |
| `projectId` | `varchar` | Primary |

## Table `role_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `role_slug` | `text` | Primary |
| `permission_code` | `text` | Primary |
| `created_at` | `timestamptz` |  Nullable |

## Table `role_scope`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `roleSlug` | `varchar` | Primary |
| `scopeSlug` | `varchar` | Primary |

## Table `sales_guides`

SPIN methodology sales questions contextual to products and entity types

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  Nullable |
| `entity_target` | `text` |  |
| `question_type` | `text` |  Nullable |
| `question_text` | `text` |  |
| `display_order` | `int4` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `sample_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `representative_id` | `uuid` |  |
| `created_by` | `uuid` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `notes` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `sample_banks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `health_center_id` | `uuid` |  Nullable |
| `responsible_user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `service_name` | `text` |  Nullable |
| `last_audit_date` | `timestamptz` |  Nullable |

## Table `sample_distributions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `inventory_id` | `uuid` |  Nullable |
| `visit_id` | `uuid` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `quantity` | `int4` |  |
| `distribution_date` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `signature_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `sample_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `batch_number` | `text` |  |
| `lot_number` | `text` |  Nullable |
| `quantity_total` | `int4` |  |
| `quantity_available` | `int4` |  |
| `quantity_distributed` | `int4` |  Nullable |
| `quantity_expired` | `int4` |  Nullable |
| `expiry_date` | `date` |  |
| `received_date` | `date` |  Nullable |
| `storage_location` | `text` |  Nullable |
| `temperature_requirements` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `sample_movements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |
| `movement_type` | `sample_movement_type` |  |
| `visit_id` | `uuid` |  Nullable |
| `event_id` | `uuid` |  Nullable |
| `bank_id` | `uuid` |  Nullable |
| `request_id` | `uuid` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `signature_url` | `text` |  Nullable |
| `batch_number` | `text` |  Nullable |

## Table `sample_request_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `request_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity_requested` | `int4` |  |
| `quantity_approved` | `int4` |  Nullable |

## Table `sample_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `requester_id` | `uuid` |  |
| `status` | `text` |  |
| `requested_date` | `timestamptz` |  |
| `processed_date` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `delivery_method` | `text` |  Nullable |
| `tracking_number` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `samples`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `batch_number` | `text` |  |
| `expiry_date` | `date` |  |
| `quantity_available` | `int4` |  |
| `quantity_distributed` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `scope`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `slug` | `varchar` | Primary |
| `displayName` | `text` |  Nullable |
| `description` | `text` |  Nullable |

## Table `secrets_provider_connection`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `providerKey` | `varchar` |  |
| `type` | `varchar` |  |
| `encryptedSettings` | `text` |  |
| `isEnabled` | `bool` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `security_alerts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alert_type` | `text` |  |
| `table_name` | `text` |  Nullable |
| `description` | `text` |  |
| `severity` | `text` |  Nullable |
| `is_resolved` | `bool` |  Nullable |
| `ai_safe_check` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `resolved_at` | `timestamptz` |  Nullable |

## Table `settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `key` | `varchar` | Primary |
| `value` | `text` |  |
| `loadOnStartup` | `bool` |  |

## Table `shared_credentials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `credentialsId` | `varchar` | Primary |
| `projectId` | `varchar` | Primary |
| `role` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `shared_workflow`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `workflowId` | `varchar` | Primary |
| `projectId` | `varchar` | Primary |
| `role` | `text` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `site_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `key` | `text` | Primary |
| `value` | `jsonb` |  |
| `updated_at` | `timestamptz` |  |
| `updated_by` | `uuid` |  Nullable |

## Table `specialties`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `detail` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `subscription_plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `price` | `numeric` |  |
| `currency` | `text` |  Nullable |
| `interval` | `text` |  Nullable |
| `features` | `jsonb` |  Nullable |
| `active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `slug` | `text` |  Nullable |

## Table `subscriptions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable Unique |
| `plan_name` | `text` |  |
| `status` | `text` |  Nullable |
| `current_period_start` | `timestamptz` |  Nullable |
| `current_period_end` | `timestamptz` |  Nullable |
| `price_id` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `payment_method` | `text` |  Nullable |
| `last_payment_reference` | `text` |  Nullable |
| `is_manual` | `bool` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `plan_id` | `uuid` |  Nullable |

## Table `support_tickets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `subject` | `text` |  |
| `description` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `assigned_to` | `uuid` |  Nullable |
| `resolution` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `resolved_at` | `timestamptz` |  Nullable |
| `attachment_url` | `text` |  Nullable |

## Table `system_alerts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `message` | `text` |  |
| `type` | `text` |  Nullable |
| `is_global` | `bool` |  Nullable |
| `active` | `bool` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `created_by` | `uuid` |  Nullable |

## Table `system_audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `action` | `text` |  |
| `entity` | `text` |  Nullable |
| `details` | `jsonb` |  Nullable |
| `ip_address` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `system_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `category` | `text` |  |
| `content` | `text` |  |
| `version` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `tag_entity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `id` | `varchar` | Primary |

## Table `test_case_execution`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `testRunId` | `varchar` |  |
| `executionId` | `int4` |  Nullable |
| `status` | `varchar` |  |
| `runAt` | `timestamptz` |  Nullable |
| `completedAt` | `timestamptz` |  Nullable |
| `errorCode` | `varchar` |  Nullable |
| `errorDetails` | `json` |  Nullable |
| `metrics` | `json` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `inputs` | `json` |  Nullable |
| `outputs` | `json` |  Nullable |

## Table `test_run`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `workflowId` | `varchar` |  |
| `status` | `varchar` |  |
| `errorCode` | `varchar` |  Nullable |
| `errorDetails` | `json` |  Nullable |
| `runAt` | `timestamptz` |  Nullable |
| `completedAt` | `timestamptz` |  Nullable |
| `metrics` | `json` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `runningInstanceId` | `varchar` |  Nullable |
| `cancelRequested` | `bool` |  |

## Table `token_exchange_jti`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `jti` | `varchar` | Primary |
| `expiresAt` | `timestamptz` |  |
| `createdAt` | `timestamptz` |  |

## Table `transfer_order_history`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `transfer_order_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `action` | `text` |  |
| `previous_data` | `jsonb` |  Nullable |
| `new_data` | `jsonb` |  Nullable |
| `changes_description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `transfer_order_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `transfer_order_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  Nullable |
| `quantity` | `int4` |  |
| `unit_price` | `numeric` |  |
| `bonus_units` | `int4` |  Nullable |
| `subtotal` | `numeric` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `transfer_orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `contact_id` | `uuid` |  Nullable |
| `pharmacy_name` | `text` |  |
| `pharmacy_address` | `text` |  Nullable |
| `pharmacy_phone` | `text` |  Nullable |
| `drugstore_id` | `uuid` |  Nullable |
| `drugstore_name` | `text` |  |
| `drugstore_code` | `text` |  Nullable |
| `order_number` | `text` |  Nullable |
| `order_date` | `date` |  |
| `delivery_date` | `date` |  Nullable |
| `products` | `jsonb` |  |
| `subtotal` | `numeric` |  Nullable |
| `tax` | `numeric` |  Nullable |
| `total` | `numeric` |  Nullable |
| `status` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `internal_notes` | `text` |  Nullable |
| `document_generated` | `bool` |  Nullable |
| `document_url` | `text` |  Nullable |
| `sent_to_email` | `text` |  Nullable |
| `sent_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `drogueria_final_id` | `uuid` |  Nullable |
| `codigo_pedido_externo` | `text` |  Nullable |
| `notas_telemarketing` | `text` |  Nullable |
| `confirmed_at` | `timestamptz` |  Nullable |
| `items_snapshot` | `jsonb` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `order_type` | `transfer_order_type` |  Nullable |

## Table `user`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `varchar` |  Nullable Unique |
| `firstName` | `varchar` |  Nullable |
| `lastName` | `varchar` |  Nullable |
| `password` | `varchar` |  Nullable |
| `personalizationAnswers` | `json` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `settings` | `json` |  Nullable |
| `disabled` | `bool` |  |
| `mfaEnabled` | `bool` |  |
| `mfaSecret` | `text` |  Nullable |
| `mfaRecoveryCodes` | `text` |  Nullable |
| `lastActiveAt` | `date` |  Nullable |
| `roleSlug` | `varchar` |  |

## Table `user_api_keys`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `userId` | `uuid` |  |
| `label` | `varchar` |  |
| `apiKey` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `scopes` | `json` |  Nullable |
| `audience` | `varchar` |  |

## Table `user_favorites`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `user_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Unique |
| `company_id` | `uuid` |  Nullable |
| `role` | `text` |  |
| `permissions` | `jsonb` |  Nullable |
| `territory` | `text` |  Nullable |
| `supervisor_id` | `uuid` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `state` | `text` |  Nullable |
| `region` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |

## Table `user_roles_plain`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `role` | `text` |  |
| `organization_id` | `uuid` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `state` | `text` |  Nullable |
| `region` | `text` |  Nullable |
| `supervisor_id` | `uuid` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `user_zones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `zone_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `variables`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `key` | `varchar` |  |
| `type` | `varchar` |  |
| `value` | `varchar` |  Nullable |
| `id` | `varchar` | Primary |
| `projectId` | `varchar` |  Nullable |

## Table `visit_products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `visit_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity_presented` | `int4` |  Nullable |
| `samples_given` | `int4` |  Nullable |
| `material_left` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `visit_series`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `contact_id` | `uuid` |  |
| `day_of_week` | `int4` |  |
| `preferred_time` | `time` |  |
| `turn` | `text` |  Nullable |
| `frequency` | `text` |  |
| `visit_type` | `text` |  Nullable |
| `visit_objective` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `start_date` | `date` |  |
| `end_date` | `date` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `visits`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `scheduled_date` | `timestamptz` |  Nullable |
| `status` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `contact_id` | `uuid` |  Nullable |
| `notes` | `text` |  Nullable |
| `zone_id` | `uuid` |  Nullable |
| `pharmacy_id` | `uuid` |  Nullable |
| `company_id` | `uuid` |  Nullable |
| `location_lat` | `numeric` |  Nullable |
| `location_lng` | `numeric` |  Nullable |
| `checkin_at` | `timestamptz` |  Nullable |
| `checkout_at` | `timestamptz` |  Nullable |
| `visit_type` | `text` |  Nullable |
| `visit_objective` | `text` |  Nullable |
| `visit_outcome` | `text` |  Nullable |
| `directory_item_id` | `uuid` |  Nullable |
| `actual_start_time` | `timestamptz` |  Nullable |
| `actual_end_time` | `timestamptz` |  Nullable |
| `arrival_time` | `text` |  Nullable |
| `departure_time` | `text` |  Nullable |
| `objective` | `text` |  Nullable |
| `feedback` | `text` |  Nullable |
| `results_notes` | `text` |  Nullable |
| `samples_delivered` | `text` |  Nullable |
| `products_presented` | `_text` |  Nullable |
| `products_prescribed` | `text` |  Nullable |
| `promotional_materials` | `text` |  Nullable |
| `contact_reaction` | `text` |  Nullable |
| `doctor_interest` | `text` |  Nullable |
| `emotional_state` | `text` |  Nullable |
| `purchase_driver` | `text` |  Nullable |
| `next_commitment` | `text` |  Nullable |
| `next_step` | `text` |  Nullable |
| `next_steps` | `text` |  Nullable |
| `next_visit_date` | `date` |  Nullable |
| `pending_followup` | `text` |  Nullable |
| `agreements` | `text` |  Nullable |
| `main_objection` | `text` |  Nullable |
| `competitor_activity` | `text` |  Nullable |
| `cycle_condition` | `text` |  Nullable |
| `detected_purchase_reason` | `text` |  Nullable |
| `closure_reason` | `text` |  Nullable |
| `closure_commitment` | `text` |  Nullable |
| `activity_performed` | `text` |  Nullable |
| `observations_feedback` | `text` |  Nullable |
| `key_contact` | `bool` |  Nullable |
| `is_exception` | `bool` |  Nullable |
| `out_of_range` | `bool` |  Nullable |
| `representative` | `text` |  Nullable |
| `signature_url` | `text` |  Nullable |
| `photo_url` | `text` |  Nullable |
| `file_url` | `text` |  Nullable |
| `shelf_photo_url` | `text` |  Nullable |
| `attachments` | `_text` |  Nullable |
| `geolocation` | `text` |  Nullable |
| `check_in_latitude` | `numeric` |  Nullable |
| `check_in_longitude` | `numeric` |  Nullable |
| `check_out_latitude` | `numeric` |  Nullable |
| `check_out_longitude` | `numeric` |  Nullable |
| `distance_meters` | `numeric` |  Nullable |
| `series_id` | `uuid` |  Nullable |
| `interview_data` | `jsonb` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `visibility_audit` | `jsonb` |  Nullable |
| `compromiso_inicio` | `numeric` |  Nullable |
| `selling_points` | `jsonb` |  Nullable |
| `trained_staff` | `bool` |  Nullable |
| `pop_visible` | `bool` |  Nullable |
| `competitor_brands_detected` | `_text` |  Nullable |
| `pop_checklist_completed` | `jsonb` |  Nullable |

## Table `warehouse_batches`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `warehouse_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `batch_number` | `text` |  |
| `expiry_date` | `date` |  |
| `quantity` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `expiration_date` | `date` |  Nullable |

## Table `warehouse_movements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `warehouse_id` | `uuid` |  |
| `batch_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |
| `movement_type` | `warehouse_movement_type` |  |
| `related_request_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `warehouses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `name` | `text` |  |
| `address` | `text` |  Nullable |
| `is_main` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `webhook_entity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `webhookPath` | `varchar` | Primary |
| `method` | `varchar` | Primary |
| `node` | `varchar` |  |
| `webhookId` | `varchar` |  Nullable |
| `pathLength` | `int4` |  Nullable |
| `workflowId` | `varchar` |  |

## Table `weekly_plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `cycle_id` | `uuid` |  |
| `week_number` | `int4` |  |
| `start_date` | `date` |  |
| `end_date` | `date` |  |
| `status` | `text` |  Nullable |
| `supervisor_comment` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `work_processes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `department` | `text` |  Nullable |
| `responsible_person` | `text` |  Nullable |
| `objectives` | `text` |  Nullable |
| `scope` | `text` |  Nullable |
| `diagram_nodes` | `jsonb` |  Nullable |
| `diagram_edges` | `jsonb` |  Nullable |
| `risks` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `workflow_builder_session`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `workflowId` | `varchar` |  |
| `userId` | `uuid` |  |
| `messages` | `json` |  |
| `previousSummary` | `text` |  Nullable |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `activeVersionCardId` | `varchar` |  Nullable |
| `resumeAfterRestoreMessageId` | `varchar` |  Nullable |

## Table `workflow_dependency`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `workflowId` | `varchar` |  |
| `workflowVersionId` | `int4` |  |
| `dependencyType` | `varchar` |  |
| `dependencyKey` | `varchar` |  |
| `dependencyInfo` | `json` |  Nullable |
| `indexVersionId` | `int2` |  |
| `createdAt` | `timestamptz` |  |
| `publishedVersionId` | `varchar` |  Nullable |

## Table `workflow_entity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `varchar` |  |
| `active` | `bool` |  |
| `nodes` | `json` |  |
| `connections` | `json` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `settings` | `json` |  Nullable |
| `staticData` | `json` |  Nullable |
| `pinData` | `json` |  Nullable |
| `versionId` | `bpchar` |  |
| `triggerCount` | `int4` |  |
| `id` | `varchar` | Primary |
| `meta` | `json` |  Nullable |
| `parentFolderId` | `varchar` |  Nullable |
| `isArchived` | `bool` |  |
| `versionCounter` | `int4` |  |
| `description` | `text` |  Nullable |
| `activeVersionId` | `varchar` |  Nullable |

## Table `workflow_history`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `versionId` | `varchar` | Primary |
| `workflowId` | `varchar` |  |
| `authors` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |
| `nodes` | `json` |  |
| `connections` | `json` |  |
| `name` | `varchar` |  Nullable |
| `autosaved` | `bool` |  |
| `description` | `text` |  Nullable |

## Table `workflow_publish_history`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `workflowId` | `varchar` |  |
| `versionId` | `varchar` |  |
| `event` | `varchar` |  |
| `userId` | `uuid` |  Nullable |
| `createdAt` | `timestamptz` |  |

## Table `workflow_published_version`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `workflowId` | `varchar` | Primary |
| `publishedVersionId` | `varchar` |  |
| `createdAt` | `timestamptz` |  |
| `updatedAt` | `timestamptz` |  |

## Table `workflow_statistics`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `count` | `int8` |  Nullable |
| `latestEvent` | `timestamptz` |  Nullable |
| `name` | `varchar` |  |
| `workflowId` | `varchar` |  |
| `rootCount` | `int8` |  Nullable |
| `id` | `int4` | Primary |
| `workflowName` | `varchar` |  Nullable |

## Table `workflows_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `workflowId` | `varchar` | Primary |
| `tagId` | `varchar` | Primary |

## Table `zones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `state` | `text` |  Nullable |
| `region` | `text` |  Nullable |
| `organization_id` | `uuid` |  Nullable |
| `sales_threshold` | `numeric` |  Nullable |

