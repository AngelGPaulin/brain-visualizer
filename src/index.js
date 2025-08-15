document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos del DOM ---
    const plotDiv = document.getElementById('plot');
    const roiSelect = document.getElementById('roi-select');
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValueSpan = document.getElementById('opacity-value');
    const editRegionBtn = document.getElementById('edit-region-btn');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const resetRoisBtn = document.getElementById('reset-rois-btn');

    // Elementos del Modal
    const modal = document.getElementById('edit-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editForm = document.getElementById('edit-form');
    const editNameInput = document.getElementById('edit-name');
    const editDescriptionInput = document.getElementById('edit-description');

    // --- Variables Globales ---
    const brainTraceIndex = 0;
    const roiTraceIndex = 1;
    let allMeshes = null;
    let customData = {}; // Aquí guardaremos los datos personalizados en memoria

    // --- Funciones del Gráfico (Plotly) ---

    const initPlot = () => {
        const brainMesh = allMeshes.brain_mesh;
        const roiMeshes = allMeshes.roi_meshes;

        const brainTrace = {
            type: 'mesh3d',
            x: brainMesh.verts.map(v => v[0]), y: brainMesh.verts.map(v => v[1]), z: brainMesh.verts.map(v => v[2]),
            i: brainMesh.faces.map(f => f[0]), j: brainMesh.faces.map(f => f[1]), k: brainMesh.faces.map(f => f[2]),
            color: brainMesh.color, opacity: parseFloat(opacitySlider.value), name: 'Cerebro Completo', hoverinfo: 'name'
        };

        const initialRoiTrace = {
            type: 'mesh3d',
            x: roiMeshes[0].verts.map(v => v[0]), y: roiMeshes[0].verts.map(v => v[1]), z: roiMeshes[0].verts.map(v => v[2]),
            i: roiMeshes[0].faces.map(f => f[0]), j: roiMeshes[0].faces.map(f => f[1]), k: roiMeshes[0].faces.map(f => f[2]),
            color: roiMeshes[0].color, opacity: 1.0, name: roiMeshes[0].name, hoverinfo: 'name'
        };

        const traces = [brainTrace, initialRoiTrace];
        const layout = {
            title: { text: 'Visualización 3D: ' + roiMeshes[0].name, font: { color: '#333' } },
            scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false } },
            autosize: true
        };

        Plotly.newPlot(plotDiv, traces, layout);
    };

    /**
     * Carga los datos iniciales y los datos personalizados desde los archivos JSON.
     */
    const loadData = async () => {
        try {
            // 1. Cargar el JSON con los datos del cerebro
            const brainResponse = await fetch('brain_data.json');
            if (!brainResponse.ok) throw new Error('No se pudo cargar brain_data.json');
            allMeshes = await brainResponse.json();

            // 2. Intentar cargar el JSON con los nombres personalizados
            try {
                const customResponse = await fetch('custom_data.json');
                if (customResponse.ok) {
                    customData = await customResponse.json();
                    // Aplicar los datos personalizados a las mallas
                    allMeshes.roi_meshes.forEach((mesh, index) => {
                        if (customData[index]) {
                            mesh.name = customData[index].name || mesh.name;
                            mesh.description = customData[index].description || '';
                        }
                    });
                }
            } catch (error) {
                console.log("No se encontró 'custom_data.json'. Se usarán los nombres por defecto.");
            }
            
            // 3. Llenar el selector y configurar la aplicación
            roiSelect.innerHTML = ''; // Limpiar opciones previas
            allMeshes.roi_meshes.forEach((mesh, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = mesh.name;
                roiSelect.appendChild(option);
            });

            initPlot();
            setupEventListeners();

        } catch (error) {
            console.error('Error fatal al cargar los datos:', error);
            plotDiv.innerHTML = `<p class="error-message">Error al cargar archivos. Asegúrate de que "brain_data.json" exista.</p>`;
        }
    };
    
    // --- Lógica de Eventos ---

    const setupEventListeners = () => {
        // Slider de opacidad
        opacitySlider.addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            opacityValueSpan.textContent = opacity;
            Plotly.restyle(plotDiv, { opacity: opacity }, [brainTraceIndex]);
        });

        // Selector de ROI
        roiSelect.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value, 10);
            const selectedROI = allMeshes.roi_meshes[selectedIndex];
            
            Plotly.relayout(plotDiv, { title: { text: 'Visualización 3D: ' + selectedROI.name }});
            Plotly.restyle(plotDiv, {
                x: [selectedROI.verts.map(v => v[0])], y: [selectedROI.verts.map(v => v[1])], z: [selectedROI.verts.map(v => v[2])],
                i: [selectedROI.faces.map(f => f[0])], j: [selectedROI.faces.map(f => f[1])], k: [selectedROI.faces.map(f => f[2])],
                color: [selectedROI.color], name: [selectedROI.name]
            }, [roiTraceIndex]);
        });
        
        // --- Eventos del Modal de Edición ---
        editRegionBtn.addEventListener('click', () => {
            const selectedIndex = parseInt(roiSelect.value, 10);
            const selectedROI = allMeshes.roi_meshes[selectedIndex];
            editNameInput.value = selectedROI.name;
            editDescriptionInput.value = selectedROI.description || '';
            modal.style.display = 'flex';
        });

        const hideModal = () => { modal.style.display = 'none'; };
        closeModalBtn.addEventListener('click', hideModal);
        cancelEditBtn.addEventListener('click', hideModal);

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedIndex = parseInt(roiSelect.value, 10);
            const newName = editNameInput.value.trim();
            const newDescription = editDescriptionInput.value.trim();

            if (!newName) {
                alert('El nombre de la región no puede estar vacío.');
                return;
            }

            // Actualizar datos en memoria
            allMeshes.roi_meshes[selectedIndex].name = newName;
            allMeshes.roi_meshes[selectedIndex].description = newDescription;
            customData[selectedIndex] = { name: newName, description: newDescription };
            
            // Actualizar la UI
            roiSelect.options[selectedIndex].textContent = newName;
            Plotly.relayout(plotDiv, { title: { text: 'Visualización 3D: ' + newName }});
            Plotly.restyle(plotDiv, { name: [newName] }, [roiTraceIndex]);
            hideModal();
        });

        // --- Eventos de los botones de archivo ---
        saveJsonBtn.addEventListener('click', () => {
            const jsonString = JSON.stringify(customData, null, 2); // El 'null, 2' formatea el JSON para que sea legible
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'custom_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('El archivo "custom_data.json" se ha generado. Guárdalo en la misma carpeta que tu index.html para cargarlo automáticamente la próxima vez.');
        });

        resetRoisBtn.addEventListener('click', () => {
             if (confirm('¿Estás seguro de que quieres restablecer todos los nombres? Los cambios no guardados en el JSON se perderán.')) {
                // Simplemente recargamos la página. Como no guardamos nada, se cargarán los datos originales.
                // Para una limpieza total, el usuario debería eliminar su archivo custom_data.json manualmente.
                window.location.reload();
            }
        });
    };

    // --- Iniciar la Aplicación ---
    loadData();
});