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
| `total_points` | `int4` |  Nullable |
| `manager_id` | `uuid` |  Nullable |

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
| `status` | `text` |  Nullable |
| `external_auth_id` | `uuid` |  Nullable |

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
| `product_code` | `text` |  Nullable |
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

## Table `product_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  Nullable |
| `last_updated` | `timestamptz` |  Nullable |

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

## Table `companies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
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

## Table `user_favorites`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

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
| `investment` | `numeric` |  Nullable |
| `per_diem` | `numeric` |  Nullable |

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
| `is_global` | `bool` |  Nullable |

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
| `workflow_status` | `text` |  Nullable |
| `approved_by_supervisor_id` | `uuid` |  Nullable |
| `approved_by_coordinator_id` | `uuid` |  Nullable |
| `approved_by_manager_id` | `uuid` |  Nullable |
| `payment_receipt_url` | `text` |  Nullable |
| `rejection_reason` | `text` |  Nullable |

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
| `routing_days` | `text` |  Nullable |
| `lat` | `float8` |  Nullable |
| `lng` | `float8` |  Nullable |

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
| `pharmacy_id` | `uuid` |  Nullable |

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
| `target_sales` | `numeric` |  Nullable |
| `current_sales` | `numeric` |  Nullable |
| `zone_id` | `uuid` |  Nullable |

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
| `routing_days` | `text` |  Nullable |

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

## Table `lista_precios_biofarco`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `producto_id` | `uuid` |  Unique |
| `precio_base` | `numeric` |  |
| `updated_at` | `timestamptz` |  |

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
| `drugstore_id` | `uuid` |  Nullable |
| `notes` | `text` |  Nullable |
| `approved_at` | `timestamptz` |  Nullable |
| `approved_by` | `uuid` |  Nullable |

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
| `drugstore_id` | `uuid` |  Nullable |
| `precio_fijado` | `numeric` |  Nullable |

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

## Table `rep_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |
| `updated_at` | `timestamptz` |  |

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

## Table `sample_request_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `request_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity_requested` | `int4` |  |
| `quantity_approved` | `int4` |  Nullable |

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

## Table `assignment_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `assignment_id` | `uuid` |  |
| `product_id` | `uuid` |  |
| `quantity` | `int4` |  |

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

## Table `debug_triggers_dump`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `event_object_schema` | `name` |  Nullable |
| `event_object_table` | `name` |  Nullable |
| `trigger_name` | `name` |  Nullable |
| `action_statement` | `varchar` |  Nullable |
| `action_timing` | `varchar` |  Nullable |

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

## Table `pop_assignment_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `assignment_id` | `uuid` |  Nullable |
| `material_id` | `uuid` |  Nullable |
| `quantity` | `int4` |  |

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

## Table `product_specialties`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  Nullable |
| `specialty` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

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
| `org_role_id` | `uuid` |  Nullable |

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
| `plan_id` | `uuid` |  Nullable |
| `plan_modules` | `jsonb` |  Nullable |
| `max_users` | `int4` |  Nullable |
| `max_zones` | `int4` |  Nullable |
| `trial_days_used` | `int4` |  Nullable |

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
| `organization_id` | `uuid` |  Nullable |

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

## Table `pharmacy_scores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `pharmacy_id` | `uuid` | Primary |
| `score` | `int4` |  Nullable |
| `level` | `text` |  Nullable |
| `last_updated` | `timestamptz` |  Nullable |
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
| `company_id` | `uuid` |  Nullable |

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

## Table `app_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `code` | `text` | Primary |
| `name` | `text` |  |
| `module` | `text` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `role_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `role_slug` | `text` | Primary |
| `permission_code` | `text` | Primary |
| `created_at` | `timestamptz` |  Nullable |
| `access_level` | `text` |  |

## Table `user_zones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `zone_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Custom Types / Enums

### `contact_type`

`doctor` | `pharmacy` | `hospital` | `clinic` | `natural_store` | `drugstore` | `commerce`

### `visit_status`

`scheduled` | `completed` | `cancelled` | `no_show`

### `priority_level`

`low` | `medium` | `high` | `urgent`

### `sample_movement_type`

`promotion` | `transfer_in` | `transfer_out` | `treatment_start` | `bank_delivery` | `adjustment` | `warehouse_in` | `visit_drop` | `bank_deposit` | `bank_audit_consumption`

### `warehouse_movement_type`

`inbound_purchase` | `outbound_dispatch` | `adjustment` | `return` | `sale` | `conversion_in` | `conversion_out` | `SALE`

### `transfer_order_type`

`transfer` | `direct_sale`

## RLS Policies

### `debug_triggers_dump`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read for admins` | SELECT | authenticated | PERMISSIVE | `((auth.jwt() ->> 'role'::text) = 'admin'::text)` | — |

### `subscriptions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `invoices`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `system_alerts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `promotional_cycle_products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pcp` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pcp` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `app_roles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow full access for master` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'master'::text))))` | — |
| `Master/Admin manage roles` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text])))))` | — |
| `Public read access for roles` | SELECT | public | PERMISSIVE | `true` | — |
| `System Read Access` | SELECT | authenticated | PERMISSIVE | `(auth.uid() IS NOT NULL)` | — |

### `warehouses`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Warehouse Isolation` | ALL | authenticated | PERMISSIVE | `(organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid())))` | — |
| `org_isolation_warehouses` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |

### `doctor_scores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable full access for admin/master` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Enable read access for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `pharmacy_reports`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `activities`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can create activities` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can delete own activities` | DELETE | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Users can update own activities` | UPDATE | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Users can view activities in their organization` | SELECT | public | PERMISSIVE | `(organization_id IN ( SELECT user_roles.organization_id    FROM user_roles   WHERE (user_roles.user_id = auth.uid())))` | — |

### `system_audit_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `product_specialties`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_psp` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_psp` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `audit_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |
| `audit_insert_policy` | INSERT | public | PERMISSIVE | — | `true` |

### `pharmacy_drugstore_relations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pdr` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pdr` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `contact_health_centers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `pharmacy_scores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `registro_pvp_farmacia`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Audit Management Access` | ALL | authenticated | PERMISSIVE | `((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) AND (EXISTS ( SELECT 1    FROM contacts c   WHERE ((c.id = registro_pvp_farmacia.pharmacy_id) AND (c.organization_id = get_my_organization_id())))))` | `((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) AND (EXISTS ( SELECT 1    FROM contacts c   WHERE ((c.id = registro_pvp_farmacia.pharmacy_id) AND (c.organization_id = get_my_organization_id())))))` |
| `Org Territory Audit Access` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM contacts c   WHERE ((c.id = registro_pvp_farmacia.pharmacy_id) AND (c.organization_id = get_my_organization_id()) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = 'supervisor'::text) AND (c.zone_id = get_my_zone_id())) OR ((get_my_role() = 'representative'::text) AND ((c.user_id)::text = (auth.uid())::text))))))` | — |

### `lista_precios_biofarco`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_lpb` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_lpb` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `inventario_droguerias`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_id` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_id` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `directory_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable full access for admin/master` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Master Write Directory` | ALL | authenticated | PERMISSIVE | `is_system_master()` | — |
| `Universal Read Directory` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `distributors`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Tenant Distributor Access` | ALL | public | PERMISSIVE | `(organization_id = get_my_organization_id())` | — |

### `warehouse_movements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Movements Access` | ALL | public | PERMISSIVE | `(organization_id = get_my_organization_id())` | `((organization_id = get_my_organization_id()) AND is_org_admin())` |
| `org_isolation_movements` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |

### `warehouse_batches`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Batches Access` | ALL | public | PERMISSIVE | `(organization_id = get_my_organization_id())` | `((organization_id = get_my_organization_id()) AND is_org_admin())` |
| `org_isolation_batches` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |

### `cycles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `specialties`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow full access for specialties to admin and master` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text]))` | — |
| `System Read Access` | SELECT | authenticated | PERMISSIVE | `(auth.uid() IS NOT NULL)` | — |

### `companies`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Companies` | ALL | authenticated | PERMISSIVE | `((id = get_my_organization_id()) OR is_master())` | `((id = get_my_organization_id()) OR is_master())` |

### `billing_prices`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `field_evaluations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Reps Read Own Evaluations` | SELECT | authenticated | PERMISSIVE | `((representative_id = auth.uid()) OR (get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text])))` | — |
| `Supervisors Manage Evaluations` | ALL | authenticated | PERMISSIVE | `(get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text]))` | `(get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text]))` |

### `daily_plan_details`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `billing_plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Master manage billing plans` | ALL | public | PERMISSIVE | `is_master()` | — |
| `Solo master puede gestionar planes` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_master = true))))` | — |
| `System Read Access` | SELECT | authenticated | PERMISSIVE | `(auth.uid() IS NOT NULL)` | — |

### `health_centers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Health Center Isolation` | ALL | authenticated | PERMISSIVE | `(organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid())))` | — |
| `Org Health Centers Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text])) OR (get_my_role() = 'representative'::text)))` | — |
| `Org Health Centers Access Enhanced` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = ANY (ARRAY['supervisor'::text, 'chief'::text, 'coordinator'::text])) AND ((state = get_my_state()) OR is_subordinate(user_id) OR ((user_id)::text = (auth.uid())::text))) OR ((get_my_role() = 'representative'::text) AND ((user_id)::text = (auth.uid())::text))))` | — |
| `Universal Health Centers Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text, 'coordinator'::text, 'telemarketing'::text, 'chief'::text])) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `health_centers_org_select` | SELECT | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Notifications Access` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) AND (user_id = auth.uid()))` | — |
| `User Notification Isolation` | ALL | authenticated | PERMISSIVE | `((user_id = auth.uid()) OR (organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid()))))` | — |
| `Users can see their own notifications` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for relationship joins` | SELECT | public | PERMISSIVE | `true` | — |
| `Master can CRUD profiles` | ALL | authenticated | PERMISSIVE | `is_master()` | `is_master()` |
| `Master full management profiles` | ALL | public | PERMISSIVE | `is_master()` | — |
| `Master_God_Mode_Profiles` | ALL | public | PERMISSIVE | `(is_system_master() OR (id = auth.uid()) OR (organization_id = get_my_organization_id()))` | — |
| `Safe View Profiles` | SELECT | public | PERMISSIVE | `((id = auth.uid()) OR (organization_id = get_my_organization_id()))` | — |
| `Users can update own profile` | UPDATE | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can view own profile` | SELECT | authenticated | PERMISSIVE | `((user_id = auth.uid()) OR is_master())` | — |
| `profiles_modify_policy` | ALL | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access())` | — |
| `profiles_select_policy` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access() OR auth_is_manager_of(user_id))` | — |

### `user_zones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master can CRUD user_zones` | ALL | authenticated | PERMISSIVE | `is_master()` | `is_master()` |
| `Permitir gestión a Managers y Admins` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles ur   WHERE ((ur.user_id = auth.uid()) AND (ur.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'coordinator'::text])))))` | — |
| `Permitir lectura a usuarios autenticados` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `deals`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can create deals` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can delete own deals` | DELETE | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Users can update own deals` | UPDATE | public | PERMISSIVE | `((auth.uid() = user_id) OR (organization_id IN ( SELECT user_roles.organization_id    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text]))))))` | — |
| `Users can view deals in their organization` | SELECT | public | PERMISSIVE | `(organization_id IN ( SELECT user_roles.organization_id    FROM user_roles   WHERE (user_roles.user_id = auth.uid())))` | — |

### `system_documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sysdoc` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sysdoc` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `training_lessons`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Lectura Lecciones` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `training_exams`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Lectura Exámenes` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `training_questions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Lectura Preguntas` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `user_training_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Usuario actualiza su propio progreso` | UPDATE | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Usuario inserta su propio progreso` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Usuario lee su propio progreso` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `fixed_assets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable full access for admin/master` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Enable read access for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `master_users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master users are readable by authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Master_Read_All_MasterUsers` | SELECT | authenticated | PERMISSIVE | `is_system_master()` | — |
| `System only read master_users` | SELECT | authenticated | PERMISSIVE | `false` | — |
| `Users can read own master status` | SELECT | authenticated | PERMISSIVE | `(email = (auth.jwt() ->> 'email'::text))` | — |
| `Users can view own master status safe` | SELECT | authenticated | PERMISSIVE | `(email = (auth.jwt() ->> 'email'::text))` | — |
| `self_read_master` | SELECT | authenticated | PERMISSIVE | `(lower(email) = lower((auth.jwt() ->> 'email'::text)))` | — |

### `rewards_catalog`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins and managers can manage rewards` | ALL | public | PERMISSIVE | `(((organization_id = get_my_organization_id()) AND (EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'manager'::text, 'gerente'::text])) AND (user_roles.organization_id = rewards_catalog.organization_id))))) OR (EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'master'::text)))))` | — |
| `Lectura Catálogo Premios` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Users can view rewards of their organization` | SELECT | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR (organization_id IS NULL))` | — |

### `user_reward_redemptions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Usuario inserta sus canjes` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Usuario lee sus canjes` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `weekly_plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_wp` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Manage own auth_wp` | ALL | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Read access auth_wp` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `dispensacion_pacientes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_dp` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_dp` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `rep_stats_summary`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_rss` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_rss` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `detalle_entrega_banco`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_deb` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_deb` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `dispensacion_muestras`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_dm` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_dm` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `daily_plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Permitir a representantes actualizar sus propios planes diarios` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Permitir a representantes crear planes diarios` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Permitir a representantes ver sus propios planes diarios` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `hierarchical_view_daily_plans` | SELECT | public | PERMISSIVE | `(user_id IN ( SELECT get_visible_user_ids() AS get_visible_user_ids))` | — |
| `own_delete_daily_plans` | DELETE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `own_insert_daily_plans` | INSERT | public | PERMISSIVE | — | `(user_id = auth.uid())` |
| `own_update_daily_plans` | UPDATE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `entregas_banco`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_eb` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_eb` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `doctors`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Doctors Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text])) OR (get_my_role() = 'representative'::text)))` | — |
| `Org Doctors Access Enhanced` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = ANY (ARRAY['supervisor'::text, 'chief'::text, 'coordinator'::text])) AND ((state = get_my_state()) OR is_subordinate(user_id) OR ((user_id)::text = (auth.uid())::text))) OR ((get_my_role() = 'representative'::text) AND (((user_id)::text = (auth.uid())::text) OR ((representative_id)::text = (auth.uid())::text)))))` | — |
| `Universal Doctors Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text, 'coordinator'::text, 'telemarketing'::text, 'chief'::text])) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `Users can delete own doctors` | DELETE | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can insert own doctors` | INSERT | authenticated | PERMISSIVE | — | `(user_id = auth.uid())` |
| `Users can update own doctors` | UPDATE | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users manage own doctors` | ALL | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Users view own or organization doctors based on role` | SELECT | public | PERMISSIVE | `((auth.uid() = user_id) OR ((organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.id = auth.uid()))) AND (( SELECT user_roles.role    FROM user_roles   WHERE (user_roles.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'manager'::text, 'coordinator'::text, 'supervisor'::text]))))` | — |
| `doctors_org_select` | SELECT | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `entrega_muestras`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_em` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_em` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `plan_available_roles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Public read access for plan_available_roles` | SELECT | public | PERMISSIVE | `true` | — |

### `billing_transactions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `help_articles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable full access for admin/master` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Enable read access for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `inventario_muestras`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_im` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_im` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Self management auth_im` | ALL | authenticated | PERMISSIVE | `(user_id = auth.uid())` | `(user_id = auth.uid())` |

### `expenses`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Expenses Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = 'supervisor'::text) AND ((zone_id)::text = (get_my_zone_id())::text)) OR ((get_my_role() = 'representative'::text) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `materiales_promocionales`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_mp` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_mp` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `site_settings`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated Insert Access` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `Authenticated Update Access` | UPDATE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Public Read Access` | SELECT | public | PERMISSIVE | `true` | — |

### `sales_guides`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sg` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sg` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `transfer_order_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_toi` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_toi` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `toi_org_insert` | INSERT | public | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM transfer_orders t   WHERE ((t.id = transfer_order_items.transfer_order_id) AND (t.organization_id = get_my_organization_id()))))` |
| `toi_org_select` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM transfer_orders t   WHERE ((t.id = transfer_order_items.transfer_order_id) AND (t.organization_id = get_my_organization_id()))))` | — |

### `organizations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Blindaje_Isolation_Orgs` | SELECT | authenticated | PERMISSIVE | `((id = get_user_org(auth.uid())) OR is_master(auth.uid()))` | — |
| `Master_Global_Access` | ALL | authenticated | PERMISSIVE | `(is_system_master() OR (id = ( SELECT user_roles.organization_id    FROM user_roles   WHERE (user_roles.user_id = auth.uid()))))` | — |
| `Org admins can update organization` | UPDATE | public | PERMISSIVE | `(((id)::text = (get_my_organization_id())::text) AND is_org_admin())` | — |
| `Orgs_Modify_Policy` | ALL | authenticated | PERMISSIVE | `(is_system_master() OR (id = get_my_organization_id()))` | `(is_system_master() OR (id = get_my_organization_id()))` |
| `Orgs_Select_Policy` | SELECT | authenticated | PERMISSIVE | `(is_system_master() OR (id = get_my_organization_id()) OR (id = '00000000-0000-0000-0000-000000000000'::uuid))` | — |
| `org_master_all` | ALL | public | PERMISSIVE | `is_master()` | `is_master()` |
| `org_read_policy` | SELECT | public | PERMISSIVE | `((id = get_my_organization_id()) OR is_master())` | — |

### `payment_reports`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master manage all reports` | ALL | public | PERMISSIVE | `is_master()` | — |
| `Users can insert their own payment reports` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can submit reports` | INSERT | public | PERMISSIVE | — | `((auth.uid())::text = (user_id)::text)` |
| `Users can view own reports` | SELECT | public | PERMISSIVE | `(((auth.uid())::text = (user_id)::text) OR (organization_id = get_my_organization_id()))` | — |
| `Users can view their own payment reports` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `product_inventory`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pi` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pi` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `pharmacy_stock`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_ps` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_ps` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `promotional_cycles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pcy` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pcy` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sample_inventory`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sinv` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sinv` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `samples`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sam` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sam` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `samples_modify_policy` | ALL | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access())` | — |
| `samples_select_policy` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access() OR auth_is_manager_of(user_id))` | — |

### `supervisor_routes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Access` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |

### `transfer_order_history`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_toh` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_toh` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `transfer_orders`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master_God_Mode_TransferOrders` | ALL | public | PERMISSIVE | `(is_system_master() OR (organization_id = get_my_organization_id()))` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `visit_products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_vp` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_vp` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `user_favorites`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_uf` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Manage own auth_uf` | ALL | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Read access auth_uf` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `security_alerts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master can view alerts` | ALL | public | PERMISSIVE | `is_master()` | — |

### `master_audit_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Masters can view their own audit logs` | SELECT | public | PERMISSIVE | `(auth.uid() = master_id)` | — |

### `sample_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `drugstores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Universal Drugstores Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text, 'coordinator'::text, 'telemarketing'::text, 'chief'::text])) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `Users can delete own drugstores` | DELETE | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can insert own drugstores` | INSERT | authenticated | PERMISSIVE | — | `(user_id = auth.uid())` |
| `Users can update own drugstores` | UPDATE | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can view own drugstores` | SELECT | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `sample_request_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sri` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sri` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sample_banks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sb` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sb` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `bank_inventory`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Manage Linked Bank Inventory` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM (sample_banks sb      JOIN profiles p ON ((sb.responsible_user_id = p.id)))   WHERE ((sb.id = bank_inventory.bank_id) AND (p.organization_id = ( SELECT profiles.organization_id            FROM profiles           WHERE (profiles.id = auth.uid()))) AND (( SELECT user_roles.role            FROM user_roles           WHERE (user_roles.user_id = auth.uid())          LIMIT 1) = ANY (ARRAY['admin'::text, 'manager'::text, 'master'::text, 'supervisor'::text])))))` | — |
| `View Linked Bank Inventory` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM (sample_banks sb      JOIN profiles p ON ((sb.responsible_user_id = p.id)))   WHERE ((sb.id = bank_inventory.bank_id) AND ((sb.responsible_user_id = auth.uid()) OR (p.organization_id = ( SELECT profiles.organization_id            FROM profiles           WHERE (profiles.id = auth.uid())))))))` | — |

### `rep_inventory`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Safe View Inventory` | SELECT | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `sample_movements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sm` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sm` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `commerces`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view their own organization commerces` | SELECT | public | PERMISSIVE | `(auth.uid() IN ( SELECT profiles.user_id    FROM profiles   WHERE (profiles.organization_id = commerces.organization_id)))` | — |

### `visits`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master_God_Mode_Visits` | ALL | public | PERMISSIVE | `(is_system_master() OR (organization_id = get_my_organization_id()))` | — |
| `Org Visit Isolation` | ALL | authenticated | PERMISSIVE | `(organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid())))` | — |
| `Universal Visits Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text, 'coordinator'::text, 'telemarketing'::text, 'chief'::text])) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `hierarchical_view_visits` | SELECT | public | PERMISSIVE | `(user_id IN ( SELECT get_visible_user_ids() AS get_visible_user_ids))` | — |
| `own_delete_visits` | DELETE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `own_insert_visits` | INSERT | public | PERMISSIVE | — | `(user_id = auth.uid())` |
| `own_update_visits` | UPDATE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |
| `visits_modify_policy` | ALL | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access() OR auth_is_manager_of(user_id))` | — |
| `visits_select_policy` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access() OR auth_is_manager_of(user_id) OR (EXISTS ( SELECT 1    FROM contacts   WHERE ((contacts.id = visits.contact_id) AND (contacts.external_auth_id = auth.uid())))))` | — |

### `assignment_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Manage Linked Assignments` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM sample_assignments sa   WHERE ((sa.id = assignment_items.assignment_id) AND (sa.organization_id = ( SELECT profiles.organization_id            FROM profiles           WHERE (profiles.id = auth.uid()))) AND (( SELECT user_roles.role            FROM user_roles           WHERE (user_roles.user_id = auth.uid())          LIMIT 1) = ANY (ARRAY['admin'::text, 'manager'::text, 'master'::text, 'supervisor'::text])))))` | — |
| `View Linked Assignments` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM sample_assignments sa   WHERE ((sa.id = assignment_items.assignment_id) AND ((sa.representative_id = auth.uid()) OR (sa.created_by = auth.uid()) OR (sa.organization_id = ( SELECT profiles.organization_id            FROM profiles           WHERE (profiles.id = auth.uid())))))))` | — |

### `sample_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `subscription_plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master manage plans` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles_plain   WHERE ((user_roles_plain.user_id = auth.uid()) AND (user_roles_plain.role = 'master'::text))))` | — |
| `Public read plans` | SELECT | public | PERMISSIVE | `true` | — |

### `debug_roles_dump`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read for admins` | SELECT | authenticated | PERMISSIVE | `((auth.jwt() ->> 'role'::text) = 'admin'::text)` | — |

### `support_tickets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master manage all tickets` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles_plain   WHERE ((user_roles_plain.user_id = auth.uid()) AND (user_roles_plain.role = 'master'::text))))` | — |
| `Users can manage own tickets` | ALL | public | PERMISSIVE | `(((user_id)::text = (auth.uid())::text) OR (organization_id = get_my_organization_id()) OR is_master())` | `(((user_id)::text = (auth.uid())::text) OR (organization_id = get_my_organization_id()) OR is_master())` |
| `Users create tickets` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users view own tickets` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `doctor_schedules`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |
| `Org Schedules Access` | ALL | public | PERMISSIVE | `((user_id = auth.uid()) OR is_master() OR (EXISTS ( SELECT 1    FROM contacts c   WHERE ((c.id = doctor_schedules.doctor_id) AND (c.organization_id = get_my_organization_id())))))` | — |

### `daily_plan_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |
| `hierarchical_view_daily_plan_items` | SELECT | public | PERMISSIVE | `(user_id IN ( SELECT get_visible_user_ids() AS get_visible_user_ids))` | — |
| `own_delete_daily_plan_items` | DELETE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `own_insert_daily_plan_items` | INSERT | public | PERMISSIVE | — | `(user_id = auth.uid())` |
| `own_update_daily_plan_items` | UPDATE | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `contacts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Hierarchy Contact Access` | ALL | public | PERMISSIVE | `((get_my_role() = 'master'::text) OR ((organization_id = get_my_organization_id()) AND ((get_my_role() = ANY (ARRAY['manager'::text, 'chief'::text])) OR is_in_my_hierarchy(user_id))))` | `((get_my_role() = 'master'::text) OR (organization_id = get_my_organization_id()))` |
| `Master_God_Mode_Contacts` | ALL | public | PERMISSIVE | `(is_system_master() OR (organization_id = get_my_organization_id()))` | — |
| `Org Contact Access` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = ANY (ARRAY['supervisor'::text, 'telemarketing'::text])) AND ((zone_id)::text = (get_my_zone_id())::text)) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id = get_my_organization_id()) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = ANY (ARRAY['supervisor'::text, 'telemarketing'::text])) AND ((zone_id)::text = (get_my_zone_id())::text)) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` |
| `Org Contact Access Enhanced` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = ANY (ARRAY['supervisor'::text, 'chief'::text, 'coordinator'::text])) AND ((state = get_my_state()) OR is_subordinate(user_id) OR ((user_id)::text = (auth.uid())::text))) OR ((get_my_role() = 'representative'::text) AND ((user_id)::text = (auth.uid())::text))))` | — |
| `Org Contact Isolation` | ALL | authenticated | PERMISSIVE | `(organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid())))` | — |
| `Strict Manage Own Contacts` | ALL | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Universal Contacts Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text, 'coordinator'::text, 'telemarketing'::text, 'chief'::text])) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `Users manage own contacts` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users update own contacts` | UPDATE | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `contacts_modify_policy` | ALL | public | PERMISSIVE | `((user_id = auth.uid()) OR auth_has_global_access() OR auth_is_manager_of(user_id))` | — |
| `contacts_select_policy` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR (external_auth_id = auth.uid()) OR auth_has_global_access() OR auth_is_manager_of(user_id))` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `inventory_movements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_imv` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_imv` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `app_permissions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow full access for master` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'master'::text))))` | — |
| `Master/Admin manage permissions` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text])))))` | — |
| `Public read access for permissions` | SELECT | public | PERMISSIVE | `true` | — |
| `System Read Access` | SELECT | authenticated | PERMISSIVE | `(auth.uid() IS NOT NULL)` | — |

### `expense_budgets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable full access for admin/master` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Enable read access for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Managers can view and update team events` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM (user_roles mgr      JOIN user_roles rep ON ((mgr.organization_id = rep.organization_id)))   WHERE ((mgr.user_id = auth.uid()) AND (mgr.role = ANY (ARRAY['supervisor'::text, 'manager'::text, 'chief'::text, 'master'::text])) AND (rep.user_id = events.user_id))))` | — |
| `Org Events Access` | SELECT | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |

### `pop_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Isolation Policy` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `pop_assignment_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pai` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pai` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `pop_materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `role_permissions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow full access for master` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'master'::text))))` | — |
| `Master/Admin manage role_permissions` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text])))))` | — |
| `Public read access for role_permissions` | SELECT | public | PERMISSIVE | `true` | — |
| `System Read Access` | SELECT | authenticated | PERMISSIVE | `(auth.uid() IS NOT NULL)` | — |

### `user_roles_plain`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow users to read own plain role` | SELECT | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Master_Read_All_Roles` | SELECT | authenticated | PERMISSIVE | `((user_id = auth.uid()) OR is_system_master())` | — |
| `Org User Roles Plain Access` | SELECT | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR (get_my_role() = 'master'::text))` | — |
| `Users can read own role plain` | SELECT | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `self_read_roles` | SELECT | authenticated | PERMISSIVE | `((user_id = auth.uid()) OR (supervisor_id = auth.uid()))` | — |

### `visit_series`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_vser` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_vser` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `pharmacy_trainings`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable insert for authenticated users` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `Enable read access for authenticated users` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `product_assets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pas` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pas` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `commercial_offers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Manage Linked Offers` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products p   WHERE ((p.id = commercial_offers.product_id) AND (p.organization_id = ( SELECT profiles.organization_id            FROM profiles           WHERE (profiles.id = auth.uid()))) AND (( SELECT user_roles.role            FROM user_roles           WHERE (user_roles.user_id = auth.uid())          LIMIT 1) = ANY (ARRAY['admin'::text, 'manager'::text, 'master'::text])))))` | — |
| `View Linked Offers` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products p   WHERE ((p.id = commercial_offers.product_id) AND ((p.organization_id = ( SELECT profiles.organization_id            FROM profiles           WHERE (profiles.id = auth.uid()))) OR (p.organization_id IS NULL)))))` | — |

### `quotes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `market_share_data`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Manage Org Market Data` | ALL | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) AND (get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])))` | `((organization_id = get_my_organization_id()) AND (get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])))` |
| `Read Org Market Data` | SELECT | authenticated | PERMISSIVE | `(organization_id = get_my_organization_id())` | — |

### `quote_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_qi` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_qi` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `pharmacies`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Pharmacies Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text])) OR (get_my_role() = 'representative'::text)))` | — |
| `Org Pharmacies Access Enhanced` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = ANY (ARRAY['supervisor'::text, 'chief'::text, 'coordinator'::text])) AND ((state = get_my_state()) OR is_subordinate(user_id) OR ((user_id)::text = (auth.uid())::text))) OR ((get_my_role() = 'representative'::text) AND (((user_id)::text = (auth.uid())::text) OR ((representative_id)::text = (auth.uid())::text)))))` | — |
| `Universal Pharmacies Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text, 'coordinator'::text, 'telemarketing'::text, 'chief'::text])) OR ((get_my_role() = ANY (ARRAY['representative'::text, 'commercial_rep'::text, 'visitador_medico'::text, 'rep_comercial'::text, 'rep_integral'::text])) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `pharmacies_org_select` | SELECT | authenticated | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Product Isolation` | SELECT | authenticated | PERMISSIVE | `((organization_id IS NULL) OR (organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid()))))` | — |
| `Org Products Access` | SELECT | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR (organization_id = '00000000-0000-0000-0000-000000000000'::uuid) OR (organization_id IS NULL))` | — |
| `Safe View Products` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR (organization_id = get_my_organization_id()) OR (organization_id IS NULL))` | — |

### `instance_ai_iteration_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `System Access Only` | ALL | public | PERMISSIVE | `(auth.role() = 'service_role'::text)` | — |

### `promotional_materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_pm` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_pm` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `reposiciones_banco`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_rb` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_rb` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `objectives`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Org Objectives Access` | ALL | public | PERMISSIVE | `(((organization_id)::text = (get_my_organization_id())::text) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text])) OR ((get_my_role() = 'supervisor'::text) AND ((zone_id)::text = (get_my_zone_id())::text)) OR ((get_my_role() = 'representative'::text) AND ((user_id)::text = (auth.uid())::text))))` | `((organization_id)::text = (get_my_organization_id())::text)` |
| `Users can delete objectives in their organization` | DELETE | public | PERMISSIVE | `(organization_id IN ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.id = auth.uid())))` | — |
| `Users can insert objectives in their organization` | INSERT | public | PERMISSIVE | — | `(organization_id IN ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.id = auth.uid())))` |
| `Users can update objectives in their organization` | UPDATE | public | PERMISSIVE | `(organization_id IN ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.id = auth.uid())))` | — |
| `Users can view objectives in their organization` | SELECT | public | PERMISSIVE | `(organization_id IN ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.id = auth.uid())))` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `sample_distributions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_sd` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Read access auth_sd` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `work_processes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access admin_wproc` | ALL | authenticated | PERMISSIVE | `(( SELECT user_roles_plain.role    FROM user_roles_plain   WHERE (user_roles_plain.user_id = auth.uid())  LIMIT 1) = ANY (ARRAY['admin'::text, 'master'::text, 'manager'::text]))` | — |
| `Manage own auth_wproc` | ALL | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Read access auth_wproc` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `zones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Blindaje_Isolation_Zones` | ALL | authenticated | PERMISSIVE | `((organization_id = get_user_org(auth.uid())) OR is_master(auth.uid()))` | — |
| `Enable read access for all authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Master_God_Mode_Zones` | ALL | public | PERMISSIVE | `(is_system_master() OR (organization_id = get_my_organization_id()))` | — |
| `Read access for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `tenant_isolation` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR is_master())` | `((organization_id = get_my_organization_id()) OR is_master())` |

### `compensation_policies`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view their org policies` | SELECT | public | PERMISSIVE | `(organization_id = ( SELECT profiles.organization_id    FROM profiles   WHERE (profiles.user_id = auth.uid())))` | — |

### `expense_reports`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can manage their own expense reports` | ALL | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `debug_auth_dump`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read for admins` | SELECT | authenticated | PERMISSIVE | `((auth.jwt() ->> 'role'::text) = 'admin'::text)` | — |

### `natural_stores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `System Access Only` | ALL | public | PERMISSIVE | `(auth.role() = 'service_role'::text)` | — |

### `user_roles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Master can CRUD user_roles` | ALL | authenticated | PERMISSIVE | `is_master()` | `is_master()` |
| `Master view all roles` | SELECT | authenticated | PERMISSIVE | `is_system_master()` | — |
| `Org User Roles Access` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) AND ((get_my_role() = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'supervisor'::text])) OR (user_id = auth.uid())))` | `((organization_id = get_my_organization_id()) AND (get_my_role() = ANY (ARRAY['master'::text, 'admin'::text])))` |
| `Org User Roles Manage` | ALL | public | PERMISSIVE | `((organization_id = get_my_organization_id()) AND (get_my_role() = ANY (ARRAY['master'::text, 'admin'::text])))` | `((organization_id = get_my_organization_id()) AND (get_my_role() = ANY (ARRAY['master'::text, 'admin'::text])))` |
| `Safe View User Roles` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR (organization_id = get_my_organization_id()))` | — |
| `Users can view own roles` | SELECT | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users_Read_Own_Roles` | SELECT | authenticated | PERMISSIVE | `((auth.uid() = user_id) OR is_system_master())` | — |
| `supervisor_read_subordinates` | SELECT | authenticated | PERMISSIVE | `((user_id = auth.uid()) OR (supervisor_id = auth.uid()))` | — |

### `training_modules`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins and managers can manage modules` | ALL | public | PERMISSIVE | `(((organization_id = get_my_organization_id()) AND (EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'manager'::text, 'gerente'::text])) AND (user_roles.organization_id = training_modules.organization_id))))) OR (EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'master'::text)))))` | — |
| `Lectura Módulos` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Users can view modules of their organization or global modules` | SELECT | public | PERMISSIVE | `((organization_id = get_my_organization_id()) OR (organization_id IS NULL))` | — |

### `quiz_questions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins manage questions` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'gerente'::text])))))` | — |
| `Questions visible to all` | SELECT | public | PERMISSIVE | `true` | — |

### `quiz_attempts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins view all attempts` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'gerente'::text])))))` | — |
| `Users own quiz attempts` | ALL | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `course_completions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins view all completions` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'gerente'::text])))))` | — |
| `Users own completions` | ALL | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `course_sections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins manage sections` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'gerente'::text])))))` | — |
| `Sections visible to org members` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM training_modules tm   WHERE ((tm.id = course_sections.module_id) AND ((tm.organization_id IS NULL) OR (tm.organization_id = ( SELECT user_roles.organization_id            FROM user_roles           WHERE (user_roles.user_id = auth.uid())          LIMIT 1))))))` | — |

### `course_lessons`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins manage lessons` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'gerente'::text])))))` | — |
| `Lessons visible to org members` | SELECT | public | PERMISSIVE | `true` | — |

### `lesson_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users own lesson progress` | ALL | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `course_quizzes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins manage quizzes` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['master'::text, 'admin'::text, 'manager'::text, 'gerente'::text])))))` | — |
| `Quizzes visible to all` | SELECT | public | PERMISSIVE | `true` | — |

### `budgets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Auth Access` | ALL | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Enable read for authenticated users on budgets` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `resource_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable insert for authenticated users on resource_requests` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Enable read for authenticated users on resource_requests` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Enable update for all authenticated users` | UPDATE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

