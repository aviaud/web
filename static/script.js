let productosGlobal = [];

function agregarProducto() {
  const tabla = document.getElementById('kardex-body');

  const nuevaFila = document.createElement('tr');
  nuevaFila.innerHTML = `
    <td><input type="text" class="form-control" placeholder="Nombre del producto"></td>
    <td><input type="number" class="form-control" placeholder="Cantidad"></td>
    <td><input type="number" step="0.01" class="form-control" placeholder="Precio"></td>
    <td><span class="fw-bold">0.00</span></td>
    <td>
      <button class="btn btn-primary me-2" onclick="guardarFila(this)">Guardar</button>
      <button class="btn btn-danger" onclick="eliminarFila(this)">Eliminar</button>
    </td>
  `;

  const inputs = nuevaFila.querySelectorAll('input');
  inputs[1].addEventListener('input', actualizarTotal);
  inputs[2].addEventListener('input', actualizarTotal);

  tabla.appendChild(nuevaFila);
}

function actualizarTotal() {
  const fila = this.closest('tr');
  const cantidad = parseFloat(fila.querySelector('input[type="number"]').value) || 0;
  const precio = parseFloat(fila.querySelector('input[step="0.01"]').value) || 0;
  const total = fila.querySelector('span');
  total.textContent = (cantidad * precio).toFixed(2);
}

function guardarFila(boton) {
  const fila = boton.closest('tr');
  const nombre = fila.querySelector('input[type="text"]').value;
  const cantidad = parseInt(fila.querySelector('input[type="number"]').value) || 0;
  const precio = parseFloat(fila.querySelector('input[step="0.01"]').value) || 0;
  const total = cantidad * precio;

  if (!nombre || cantidad <= 0 || precio <= 0) {
    mostrarAlerta('Por favor, complete todos los campos correctamente.', 'danger');
    return;
  }

  fetch('/guardar_producto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, cantidad, precio, total })
  })
    .then(response => response.json())
    .then(data => {
      mostrarAlerta(data.message, 'success');
      cargarProductosGuardados();
      boton.disabled = true;
      boton.classList.remove('btn-primary');
      boton.classList.add('btn-secondary');
      fila.querySelectorAll('input').forEach(input => input.disabled = true);
    })
    .catch(error => {
      console.error('Error:', error);
      mostrarAlerta('Error al guardar: ' + error.message, 'danger');
    });
}

function eliminarFila(boton) {
  const fila = boton.closest('tr');
  fila.remove();
}

function eliminarProductoDB(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;

  fetch(`/eliminar_producto/${id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      mostrarAlerta(data.message, 'success');
      cargarProductosGuardados();
    })
    .catch(error => {
      console.error('Error al eliminar:', error);
      mostrarAlerta('Error al eliminar: ' + error.message, 'danger');
    });
}

function mostrarAlerta(mensaje, tipo = 'success') {
  const alerta = document.getElementById('alerta');
  alerta.textContent = mensaje;
  alerta.className = `alert alert-${tipo}`;
  alerta.classList.remove('d-none');
  setTimeout(() => alerta.classList.add('d-none'), 3000);
}

function cargarProductosGuardados() {
  fetch('/productos')
    .then(response => response.json())
    .then(data => {
      productosGlobal = data.productos;
      mostrarProductos(productosGlobal);
    })
    .catch(error => {
      console.error('Error al cargar productos:', error);
    });
}

function mostrarProductos(productos) {
  const tbody = document.getElementById('productos-guardados');
  tbody.innerHTML = '';

  productos.forEach(prod => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nombre}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.precio.toFixed(2)}</td>
      <td>${prod.total.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="eliminarProductoDB(${prod.id})">🗑️</button></td>
    `;
    tbody.appendChild(fila);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', () => {
      const texto = buscador.value.toLowerCase();
      const filtrados = productosGlobal.filter(prod =>
        prod.nombre.toLowerCase().includes(texto) || prod.id.toString().includes(texto)
      );
      mostrarProductos(filtrados);
    });
  }

  cargarProductosGuardados();
});
