import subprocess
import sys
import json
import matplotlib as mpl
import nibabel as nib
from skimage import measure
import numpy as np
from nilearn import image
from scipy.ndimage import gaussian_filter  # <-- 1. Importar la función de suavizado

# --- Cargar archivos y remuestrear el atlas ---
print("Iniciando la generación de datos para la visualización...")
mni_img = nib.load('src/assets/models/mni152.nii.gz')
aal_img = nib.load('src/assets/models/aal.nii.gz')
resampled_aal_img = image.resample_img(aal_img, target_affine=mni_img.affine, target_shape=mni_img.shape, interpolation='nearest')

mni_data = mni_img.get_fdata()
resampled_aal_data = resampled_aal_img.get_fdata()
print("Archivos cargados y atlas remuestreado.")

# --- Leer las regiones del atlas AAL y asignar colores dinámicamente ---
unique_ids = np.unique(resampled_aal_data)
aal_labels = {int(id_val): f'Region_{int(id_val)}' for id_val in unique_ids if id_val > 0}
if not aal_labels:
    print("No se encontraron ROIs válidas en el archivo del atlas. Terminando el script.")
    sys.exit(1)

num_rois = len(aal_labels)
cmap = mpl.colormaps.get_cmap('Spectral')
roi_colors = [f'rgb({int(c[0]*255)}, {int(c[1]*255)}, {int(c[2]*255)})' for c in cmap(np.linspace(0, 1, num_rois))]
rois_list = []
sorted_ids = sorted(aal_labels.keys())
for i, idx in enumerate(sorted_ids):
    name = aal_labels[idx]
    rois_list.append({
        'name': name,
        'id': idx,
        'color': roi_colors[i],
        'label': name,
    })

print(f"{num_rois} ROIs y colores definidos dinámicamente.")

# --- Generar las mallas 3D y guardarlas en un diccionario ---
all_meshes = {
    'brain_mesh': {},
    'roi_meshes': []
}

# Malla del cerebro completo
threshold_brain = np.mean(mni_data[mni_data > 0])
verts_brain, faces_brain, _, _ = measure.marching_cubes(mni_data, level=threshold_brain, step_size=1)
all_meshes['brain_mesh'] = {
    'verts': verts_brain.tolist(),
    'faces': faces_brain.tolist(),
    'color': 'lightgrey'
}

# Mallas para cada ROI
for roi_item in rois_list:
    roi_id = roi_item['id']
    roi_color = roi_item['color']
    roi_mask = resampled_aal_data == roi_id
    if not np.any(roi_mask):
        continue

    masked_mni_data = mni_data * roi_mask
    
    # --- 2. Aplicar filtro Gaussiano para suavizar la ROI ---
    # El valor de sigma controla la intensidad del suavizado.
    smoothed_roi_data = gaussian_filter(masked_mni_data, sigma=1)

    min_roi_val = np.min(smoothed_roi_data[smoothed_roi_data > 0])
    max_roi_val = np.max(smoothed_roi_data)
    threshold_roi = min_roi_val + (max_roi_val - min_roi_val) / 2
    
    # Usar los datos suavizados para generar la malla
    verts_roi, faces_roi, _, _ = measure.marching_cubes(smoothed_roi_data, level=threshold_roi, step_size=1)
    
    all_meshes['roi_meshes'].append({
        'name': roi_item['name'],
        'color': roi_color,
        'verts': verts_roi.tolist(),
        'faces': faces_roi.tolist(),
    })

print("Mallas 3D para el cerebro completo y cada ROI (suavizadas) generadas.")

# Guardar los datos en un solo archivo JSON
with open('brain_data.json', 'w') as f:
    json.dump(all_meshes, f)
print("Todos los datos guardados en 'brain_data.json'.")