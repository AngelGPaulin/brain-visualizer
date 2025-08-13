import subprocess
import sys
import matplotlib.pyplot as plt
import matplotlib as mpl

# Instalamos las librerías necesarias
try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "nibabel", "plotly", "scikit-image", "nilearn", "matplotlib"])
except subprocess.CalledProcessError:
    print("Error: No se pudieron instalar las librerías. Por favor, instálalas manualmente con 'pip install nibabel plotly scikit-image nilearn matplotlib'.")
    sys.exit(1)

import nibabel as nib
from skimage import measure
import plotly.graph_objects as go
import numpy as np
from nilearn import image

# --- 1. Cargar archivos y remuestrear el atlas ---
mni_img = nib.load('mni152.nii.gz')
aal_img = nib.load('aal.nii.gz')
resampled_aal_img = image.resample_img(aal_img, target_affine=mni_img.affine, target_shape=mni_img.shape, interpolation='nearest')

mni_data = mni_img.get_fdata()
resampled_aal_data = resampled_aal_img.get_fdata()

print("Archivos cargados y atlas remuestreado.")

# --- 2. Leer las regiones del atlas AAL y asignar colores dinámicamente ---
unique_ids = np.unique(resampled_aal_data)
aal_labels = {int(id_val): f'Region_{int(id_val)}' for id_val in unique_ids if id_val > 0}

num_rois = len(aal_labels)
cmap = mpl.colormaps.get_cmap('Spectral')

# CORRECCIÓN: Obtener los colores de forma correcta
roi_colors = [f'rgb({int(c[0]*255)}, {int(c[1]*255)}, {int(c[2]*255)})' for c in cmap(np.linspace(0, 1, num_rois))]
rois = {f'{name}': {'id': idx, 'color': roi_colors[i]} for i, (idx, name) in enumerate(aal_labels.items())}

print(f"{num_rois} ROIs y colores definidos dinámicamente.")

# --- 3. Crear las mallas 3D ---
threshold_brain = np.mean(mni_data[mni_data > 0])
verts_brain, faces_brain, _, _ = measure.marching_cubes(mni_data, level=threshold_brain, step_size=1)
mesh_brain = go.Mesh3d(x=verts_brain[:, 0], y=verts_brain[:, 1], z=verts_brain[:, 2],
                       i=faces_brain[:, 0], j=faces_brain[:, 1], k=faces_brain[:, 2],
                       color='lightgrey', opacity=0.3, name='Cerebro Completo', visible=True)

roi_meshes = []
for name, data in rois.items():
    roi_id = data['id']
    roi_color = data['color']

    roi_mask = resampled_aal_data == roi_id
    masked_mni_data = mni_data * roi_mask

    if not np.any(roi_mask):
        continue

    min_roi_val = np.min(masked_mni_data[masked_mni_data > 0])
    max_roi_val = np.max(masked_mni_data)
    threshold_roi = min_roi_val + (max_roi_val - min_roi_val) / 2

    verts_roi, faces_roi, _, _ = measure.marching_cubes(masked_mni_data, level=threshold_roi, step_size=1)

    roi_mesh = go.Mesh3d(x=verts_roi[:, 0], y=verts_roi[:, 1], z=verts_roi[:, 2],
                         i=faces_roi[:, 0], j=faces_roi[:, 1], k=faces_roi[:, 2],
                         color=roi_color, opacity=1.0, name=name, visible=False)
    roi_meshes.append(roi_mesh)

print("Mallas 3D para cada ROI creadas.")

# --- 4. Crear el menú desplegable y la barra de opacidad ---
buttons = []
for i, name in enumerate(rois.keys()):
    visibility_list = [True] + [False] * len(rois)
    visibility_list[i + 1] = True
    buttons.append(dict(
        label=name,
        method='update',
        args=[{'visible': visibility_list},
              {'title': f'Visualización 3D: {name}'}]
    ))

slider_steps = [dict(label=f'{i/10:.1f}', method='restyle', args=[{'opacity': i/10}, [0]]) for i in range(11)]
slider = [dict(
    active=3,
    currentvalue={"prefix": "Opacidad del Cerebro: "},
    pad={"t": 50},
    steps=slider_steps
)]

# --- 5. Crear la figura de Plotly y añadir las capas ---
fig = go.Figure(data=[mesh_brain] + roi_meshes)
fig.update_layout(
    title_text=f"Visualización 3D: Selecciona una ROI",
    updatemenus=[dict(
        buttons=buttons,
        direction="down",
        pad={"r": 10, "t": 10},
        showactive=True,
        x=0.1,
        xanchor="left",
        y=1.15,
        yanchor="top"
    )],
    sliders=slider,
    scene=dict(xaxis_visible=False, yaxis_visible=False, zaxis_visible=False)
)

# --- 6. Guardar la visualización como un archivo HTML ---
fig.write_html('roi_dynamic_viewer.html')

print("Visualización interactiva con selección de ROI y opacidad guardada en 'roi_dynamic_viewer.html'.")