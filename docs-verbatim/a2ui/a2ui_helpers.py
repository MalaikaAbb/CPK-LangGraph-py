from copilotkit import a2ui

a2ui.create_surface(surface_id, catalog_id=...)
a2ui.update_components(surface_id, components)
a2ui.update_data_model(surface_id, {"items": data})
a2ui.render(operations=[...])  # wraps in a2ui_operations and serializes
