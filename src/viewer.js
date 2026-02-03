(() => {
  const viewerEl = document.getElementById('viewer');
  if (!viewerEl || !window.$3Dmol) return;

  const viewer = $3Dmol.createViewer(viewerEl, {
    backgroundColor: '#d6e3f1'
  });

  viewerEl.addEventListener('contextmenu', (event) => event.preventDefault());

  const slides = [
    {
      title: 'Starting structure',
      body:
        'This demo starts with the crystal structure of P38 MAP kinase (PDB 3FLY). We will use it to explore how SILCS FragMaps highlight favorable interaction regions around the binding site.'
    },
    {
      title: 'SILCS FragMaps',
      body:
        'FragMaps are 3D grids that show where different functional group types are energetically favorable around the protein. They act like binding “hot spot” maps that help interpret ligand poses.'
    },
    {
      title: 'Zoom to the binding site',
      body:
        'Use your mouse to rotate, zoom, and pan. We will focus on the ligand binding pocket to compare the crystal ligand with the refined pose.'
    },
    {
      title: 'Generic Donor FragMap',
      body:
        'The donor map highlights regions that favor hydrogen bond donors. Toggle the donor surfaces to see where donor chemistry is preferred.'
    },
    {
      title: 'Generic Acceptor FragMap',
      body:
        'The acceptor map highlights regions that favor hydrogen bond acceptors. Compare overlaps between the acceptor surfaces and ligand heteroatoms.'
    },
    {
      title: 'Generic Apolar FragMap',
      body:
        'The apolar map highlights hydrophobic regions. This helps identify nonpolar hot spots that a ligand can exploit.'
    }
  ];

  const titleEl = document.getElementById('slideTitle');
  const bodyEl = document.getElementById('slideBody');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const statusEl = document.getElementById('fragmapStatus');

  let currentSlide = 0;

  const renderSlide = () => {
    const slide = slides[currentSlide];
    if (titleEl) titleEl.textContent = slide.title;
    if (bodyEl) bodyEl.textContent = slide.body;
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === slides.length - 1;
  };

  const setStatus = (message) => {
    if (statusEl) statusEl.textContent = message;
  };

  prevBtn?.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide -= 1;
      renderSlide();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
      currentSlide += 1;
      renderSlide();
    }
  });

  const state = {
    proteinText: null,
    ligandText: null,
    ligandPath: 'from_silcsbio/3fly_cryst_lig.sdf',
    volumeData: {},
    isPanning: false,
    lastPan: { x: 0, y: 0 }
  };

  const enableRightDragPan = () => {
    const onMouseDown = (event) => {
      if (event.button !== 2) return;
      state.isPanning = true;
      state.lastPan = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    };

    const onMouseMove = (event) => {
      if (!state.isPanning) return;
      const dx = event.clientX - state.lastPan.x;
      const dy = event.clientY - state.lastPan.y;
      state.lastPan = { x: event.clientX, y: event.clientY };
      viewer.translate(dx, -dy, 0);
      viewer.render();
      event.preventDefault();
    };

    const onMouseUp = () => {
      state.isPanning = false;
    };

    viewerEl.addEventListener('mousedown', onMouseDown);
    viewerEl.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    viewerEl.addEventListener('mouseleave', onMouseUp);
  };

  const loadText = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load ${url}`);
    }
    return res.text();
  };

  const renderProtein = async () => {
    if (!state.proteinText) {
      state.proteinText = await loadText('from_silcsbio/3fly.pdb');
    }
    const model = viewer.addModel(state.proteinText, 'pdb');
    model.setStyle({}, { cartoon: { color: 'spectrum' } });
  };

  const renderLigand = async (ligandPath = state.ligandPath) => {
    if (ligandPath !== state.ligandPath || !state.ligandText) {
      state.ligandText = await loadText(ligandPath);
    }
    state.ligandPath = ligandPath;
    const model = viewer.addModel(state.ligandText, 'sdf');
    model.setStyle({}, { stick: { radius: 0.22, colorscheme: 'Jmol' } });
  };

  const fragmapConfig = {
    donor: {
      label: 'Generic Donor',
      files: ['from_silcsbio/maps/3fly.hbdon.gfe.dx', 'from_silcsbio/maps/3fly.mamn.gfe.dx'],
      color: '#2f6fff',
      isoval: -1.5
    },
    acceptor: {
      label: 'Generic Acceptor',
      files: [
        'from_silcsbio/maps/3fly.hbacc.gfe.dx',
        'from_silcsbio/maps/3fly.meoo.gfe.dx',
        'from_silcsbio/maps/3fly.acec.gfe.dx'
      ],
      color: '#f04747',
      isoval: -1.5
    },
    apolar: {
      label: 'Generic Apolar',
      files: ['from_silcsbio/maps/3fly.apolar.gfe.dx', 'from_silcsbio/maps/3fly.tipo.gfe.dx'],
      color: '#37b36b',
      isoval: -1.5
    }
  };

  const getFragmapData = async (key) => {
    if (state.volumeData[key]) return state.volumeData[key];
    const cfg = fragmapConfig[key];
    if (!cfg) return [];
    const data = await Promise.all(cfg.files.map((file) => loadText(file)));
    state.volumeData[key] = data;
    return data;
  };

  const preloadFragmaps = async () => {
    const entries = Object.keys(fragmapConfig);
    await Promise.all(entries.map((key) => getFragmapData(key)));
  };

  const addSurface = (data, cfg) => {
    const surface = viewer.addVolumetricData(data, 'dx', {
      isoval: cfg.isoval,
      color: cfg.color,
      opacity: 0.5,
      wireframe: true
    });
    if (surface !== undefined && surface !== null) return surface;
    if (window.$3Dmol?.VolumeData) {
      const volume = new $3Dmol.VolumeData(data, 'dx');
      return viewer.addVolumetricData(volume, {
        isoval: cfg.isoval,
        color: cfg.color,
        opacity: 0.5,
        wireframe: true
      });
    }
    return null;
  };

  const clearSurfaces = () => {
    try {
      viewer.removeAllSurfaces?.();
    } catch (error) {
      console.warn('removeAllSurfaces failed', error);
    }

    try {
      viewer.removeAllShapes?.();
    } catch (error) {
      console.warn('removeAllShapes failed', error);
    }

    if (viewer?.surfaces && typeof viewer.surfaces === 'object') {
      viewer.surfaces = {};
    }
  };

  const updateFragmaps = async () => {
    const checkedKeys = Array.from(
      document.querySelectorAll('#fragmapsList input[type="checkbox"]:checked')
    ).map((input) => input.dataset.map);

    clearSurfaces();

    if (!checkedKeys.length) {
      viewer.render();
      setStatus('FragMaps off. Toggle a category to load surfaces.');
      return;
    }

    const labels = checkedKeys.map((key) => fragmapConfig[key]?.label || key);
    setStatus(`Loading: ${labels.join(', ')}...`);

    for (const key of checkedKeys) {
      const cfg = fragmapConfig[key];
      if (!cfg) continue;
      const dataList = await getFragmapData(key);
      dataList.forEach((data) => addSurface(data, cfg));
    }

    viewer.render();
    setStatus(`Shown: ${labels.join(', ')}.`);
  };

  const bindFragmapControls = () => {
    const list = document.getElementById('fragmapsList');
    if (!list) return;

    list.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', async () => {
        await updateFragmaps();
      });
    });
  };

  const setDefaultFragmaps = async () => {
    const checkboxes = document.querySelectorAll('#fragmapsList input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  };

  const init = async () => {
    renderSlide();
    enableRightDragPan();
    await renderProtein();
    await renderLigand('from_silcsbio/3fly_cryst_lig.sdf');
    await preloadFragmaps();
    bindFragmapControls();
    await setDefaultFragmaps();
    viewer.zoomTo();
    viewer.render();
    setStatus('FragMaps off. Toggle a category to load surfaces.');
  };

  init();
})();
