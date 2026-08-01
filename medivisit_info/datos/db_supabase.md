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

