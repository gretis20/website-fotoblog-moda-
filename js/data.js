document.addEventListener("DOMContentLoaded", () => {
  //  ELEMENTOS DEL DOM
  const dataForm = document.getElementById("data-form"); 
// imputs del formulario
  const itemNameInput = document.getElementById("item-name");
  const itemValueInput = document.getElementById("item-value");
  const itemCategoryInput = document.getElementById("item-category"); 

  const tableBody = document.getElementById("table-body"); // cuerpo de la tabla

  const addItemBtn = document.getElementById("add-item-btn"); // botón agregar

  const updateItemBtn = document.getElementById("update-item-btn"); // botón actualizar

  const statusMessage = document.getElementById("status-message");  // mensaje de estado

  const loadingIndicator = document.getElementById("loading-indicator"); // indicador de carga

  // Modal de confirmación
  const confirmationModal = document.getElementById("confirmation-modal");
  const confirmDeleteBtn = confirmationModal.querySelector(".confirm-btn");
  const cancelDeleteBtn = confirmationModal.querySelector(".cancel-btn"); // botones de confirmar y cancelar

  //VARIABLES DE ESTADO
  let editingItemId = null;
  let itemToDeleteId = null; // ID del ítem a eliminar

  //URL DE MOCKAPI
  const API_BASE_URL = "https://69172562a7a34288a27fb40f.mockapi.io/api/v1/looks";

  // FUNCIÓN PARA FETCH CON REINTENTOS
  async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) { // intentos
      try { 
        const response = await fetch(url, options); 
        if (!response.ok) { 
          const errorText = await response.text();
          throw new Error("HTTP " + response.status + " - " + (errorText || response.statusText));
        } // si la respuesta no es ok, lanzar error
        return response;
      } catch (error) { // capturar error
        if (i === retries - 1) throw error; // si es el último intento, lanzar error
        await new Promise(res => setTimeout(res, delay)); // esperar antes de reintentar
        delay *= 2;
      }
    }
  }
  
  // MENSAJES DE ESTADO 
  function showMessage(element, message, type = "error") { // type: "error" o "success"
    element.textContent = message;
    element.classList.remove("hidden", "error", "success"); // limpiar clases
    element.classList.add(type); // agregar clase según tipo

    setTimeout(() => { 
      element.classList.add("hidden"); // ocultar mensaje después de 5 segundos
    }, 5000);
  }

  //MODO EDICIÓN
  function setEditingItem(id) { // entrar en modo edición
    editingItemId = id;
    addItemBtn.style.display = "none"; // ocultar botón agregar
    updateItemBtn.style.display = "inline-block"; // mostrar botón actualizar
  }

  function resetEditingItem() { // salir de modo edición
    editingItemId = null;
    addItemBtn.style.display = "inline-block"; // mostrar botón agregar
    updateItemBtn.style.display = "none"; // ocultar botón actualizar
  }

  // RENDERIZAR TABLA PARA MOSTRAR DATOS
  function renderTable(data) {
    tableBody.innerHTML = ""; // limpiar tabla

    if (data.length === 0) { // si no hay datos
      const row = document.createElement("tr"); 
      const empty = document.createElement("td");
      empty.colSpan = 5; // abarcar todas las columnas
      empty.classList.add("empty");
      empty.textContent = "No hay Looks para mostrar.";
      row.appendChild(empty);
      tableBody.appendChild(row);
      return; // salir si no hay datos
    }

    // crear filas para cada ítem
    data.forEach(item => {
      const row = document.createElement("tr");

      ["id", "name", "value", "category"].forEach(field => { // campos a mostrar

    // crear celda para cada campo
        const td = document.createElement("td"); 
        td.textContent = item[field]; 
        row.appendChild(td); 
      });

      // Acciones
      const actions = document.createElement("td"); // celda de acciones
      actions.classList.add("table-actions");

      const editBtn = document.createElement("button"); // botón editar
      editBtn.classList.add("edit-btn");
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => {
        setEditingItem(item.id);
        itemNameInput.value = item.name;
        itemValueInput.value = item.value;
        itemCategoryInput.value = item.category;
      });

      const deleteBtn = document.createElement("button"); // botón eliminar
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "Eliminar";
      deleteBtn.addEventListener("click", () => {
        itemToDeleteId = item.id;
        dataForm.reset();
        resetEditingItem();
        confirmationModal.style.display = "flex";
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      row.appendChild(actions);
      tableBody.appendChild(row);
    });
  }

  //  CARGAR DATOS DESDE MOCKAPI
  async function loadData() { // función para cargar datos
    loadingIndicator.classList.remove("hidden");
    try {
      const response = await fetchWithRetry(API_BASE_URL);
      const data = await response.json();
      renderTable(data);
    } catch (error) {
      showMessage(statusMessage, "Error al cargar los datos: " + error.message);
    } finally {
      loadingIndicator.classList.add("hidden");
    }
  }

  // MANEJAR ENVÍO DE FORMULARIO
  dataForm.addEventListener("submit", async event => { // al enviar el formulario
    event.preventDefault();

    const name = itemNameInput.value.trim();
    const value = parseFloat(itemValueInput.value);
    const category = itemCategoryInput.value.trim();

    if (!name || isNaN(value) || !category) { // validar campos
      showMessage(statusMessage, "Por favor completá todos los campos.");
      return;
    }

    const itemData = { name, value, category };

    loadingIndicator.classList.remove("hidden");

    try {
      let response;

      if (editingItemId) {

        // EDITAR
        response = await fetchWithRetry(`${API_BASE_URL}/${editingItemId}`, { // URL con ID
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData)
        });
        showMessage(statusMessage, "Look actualizado con éxito.", "success");
      } else {

        // AGREGAR
        response = await fetchWithRetry(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData)
        });
        showMessage(statusMessage, "Look agregado con éxito.", "success");
      }

      await response.json();
      dataForm.reset();
      resetEditingItem();
      loadData();

    } catch (error) {
      showMessage(statusMessage, "Error al guardar: " + error.message);
    } finally {
      loadingIndicator.classList.add("hidden");
    }
  });

  // CONFIRMAR ELIMINACIÓN
  confirmDeleteBtn.addEventListener("click", async () => { // al confirmar eliminación
    confirmationModal.style.display = "none";

    if (!itemToDeleteId) return; // si no hay ítem seleccionado, salir

    loadingIndicator.classList.remove("hidden"); // mostrar indicador de carga

    try {
      await fetchWithRetry(`${API_BASE_URL}/${itemToDeleteId}`, { 
        method: "DELETE"
      }); // eliminar ítem

      showMessage(statusMessage, "Look eliminado con éxito.", "success");
      loadData();
    } catch (error) {
      showMessage(statusMessage, "Error al eliminar: " + error.message);
    } finally {
      loadingIndicator.classList.add("hidden");
      itemToDeleteId = null;
    }
  }); 

  cancelDeleteBtn.addEventListener("click", () => { 
    confirmationModal.style.display = "none";
    itemToDeleteId = null; // limpiar ítem a eliminar
  });

  // CARGAR DATOS INICIALES
  loadData();
});
