document.addEventListener("DOMContentLoaded", () => {
    const plotDiv = document.getElementById('plot');
    const roiSelect = document.getElementById('roi-select');
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValueSpan = document.getElementById('opacity-value');
    
    const brainTraceIndex = 0;
    const roiTraceIndex = 1;
    let allMeshes = null;

    const initPlot = () => {
        const brainMesh = allMeshes.brain_mesh;
        const roiMeshes = allMeshes.roi_meshes;

        const brainTrace = {
            type: 'mesh3d',
            x: brainMesh.verts.map(v => v[0]),
            y: brainMesh.verts.map(v => v[1]),
            z: brainMesh.verts.map(v => v[2]),
            i: brainMesh.faces.map(f => f[0]),
            j: brainMesh.faces.map(f => f[1]),
            k: brainMesh.faces.map(f => f[2]),
            color: brainMesh.color,
            opacity: parseFloat(opacitySlider.value),
            name: 'Cerebro Completo',
            hoverinfo: 'name'
        };

        const initialRoiTrace = {
            type: 'mesh3d',
            x: roiMeshes[0].verts.map(v => v[0]),
            y: roiMeshes[0].verts.map(v => v[1]),
            z: roiMeshes[0].verts.map(v => v[2]),
            i: roiMeshes[0].faces.map(f => f[0]),
            j: roiMeshes[0].faces.map(f => f[1]),
            k: roiMeshes[0].faces.map(f => f[2]),
            color: roiMeshes[0].color,
            opacity: 1.0,
            name: roiMeshes[0].name,
            hoverinfo: 'name'
        };

        const traces = [brainTrace, initialRoiTrace];

        const layout = {
            title: {
                text: 'Visualización 3D: ' + roiMeshes[0].name,
                font: { color: '#333' }
            },
            scene: {
                xaxis: { visible: false },
                yaxis: { visible: false },
                zaxis: { visible: false },
            },
            autosize: true
        };

        Plotly.newPlot(plotDiv, traces, layout);
    };

    const loadData = () => {
        fetch('brain_data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar brain_data.json');
                }
                return response.json();
            })
            .then(data => {
                allMeshes = data;
                
                allMeshes.roi_meshes.forEach((mesh, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = mesh.name;
                    roiSelect.appendChild(option);
                });

                initPlot();
                setupEventListeners();
            })
            .catch(error => {
                console.error('Error al cargar archivos iniciales:', error);
                plotDiv.innerHTML = '<p class="error-message">Error al cargar el archivo de datos. Asegúrate de que "brain_data.json" exista y que el servidor local esté funcionando.</p>';
            });
    };

    const setupEventListeners = () => {
        opacitySlider.addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            opacityValueSpan.textContent = opacity;
            Plotly.restyle(plotDiv, { opacity: opacity }, [brainTraceIndex]);
        });

        roiSelect.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            const selectedROI = allMeshes.roi_meshes[selectedIndex];
            
            Plotly.relayout(plotDiv, { title: { text: 'Visualización 3D: ' + selectedROI.name }});
            
            Plotly.restyle(plotDiv, {
                x: [selectedROI.verts.map(v => v[0])],
                y: [selectedROI.verts.map(v => v[1])],
                z: [selectedROI.verts.map(v => v[2])],
                i: [selectedROI.faces.map(f => f[0])],
                j: [selectedROI.faces.map(f => f[1])],
                k: [selectedROI.faces.map(f => f[2])],
                color: [selectedROI.color],
                name: [selectedROI.name],
                visible: [true]
            }, [roiTraceIndex]);
        });
    };

    loadData();
});