.. note::
    :class: sphx-glr-download-link-note

    Click :ref:`here <sphx_glr_download_auto_examples_viz_animated_surfaces.py>` to download the full example code
.. rst-class:: sphx-glr-example-title

.. _sphx_glr_auto_examples_viz_animated_surfaces.py:


===============================================
Animated 2D functions
===============================================

This is a simple demonstration of how one can
animate 2D functions using FURY.

Importing necessary modules


.. code-block:: default


    from fury import window, actor, ui, utils, colormap
    import numpy as np
    import itertools








The following function is used to create and update the coordinates of the
points which are being used to plot the surface. It's also used to create
and update the colormap being used to color the surface.
Kindly note that only the z coordinate is being modified with time as only
the z coordinate is a function of time.


.. code-block:: default



    def update_surface(x, y, equation, cmap_name='viridis'):

        # z is the function F i.e. F(x, y, t)
        z = eval(equation)
        xyz = np.vstack([x, y, z]).T

        # creating the colormap
        v = np.copy(z)
        v /= np.max(np.abs(v), axis=0)
        colors = colormap.create_colormap(v, name=cmap_name)

        return xyz, colors








Variables and their usage-
time: float
      initial value of the time variable i.e. value of the time variable at
      the beginning of the program; (default = 0)
dt: float
    amount by which ``time`` variable is incremented for every iteration
    of timer_callback function (default = 0.1)
lower_xbound: float
              lower bound of the x values in which the function is plotted
              (default = -1)
upper_xbound: float
              Upper bound of the x values in which the function is plotted
              (default = 1)
lower_ybound: float
              lower bound of the y values in which the function is plotted
              (default = -1)
upper_ybound: float
              Upper bound of the y values in which the function is plotted
              (default = 1)
npoints: int
         For high quality rendering, keep the number high but kindly note
         that higher values for npoints slows down the animation
         (default = 128)



.. code-block:: default


    time = 0
    dt = 0.1
    lower_xbound = -1
    upper_xbound = 1
    lower_ybound = -1
    upper_ybound = 1
    npoints = 128







creating the x, y points which will be used to fit the equation to get
elevation and generate the surface


.. code-block:: default

    x = np.linspace(lower_xbound, upper_xbound, npoints)
    y = np.linspace(lower_ybound, upper_ybound, npoints)
    x, y = np.meshgrid(x, y)
    x = x.reshape(-1)
    y = y.reshape(-1)







Function used to create surface obtained from 2D equation.


.. code-block:: default



    def create_surface(x, y, equation, colormap_name):
        xyz, colors = update_surface(x, y, equation=equation,
                                     cmap_name=colormap_name)
        surf = actor.surface(xyz, colors=colors)
        surf.equation = equation
        surf.cmap_name = colormap_name
        surf.vertices = utils.vertices_from_actor(surf)
        surf.no_vertices_per_point = len(surf.vertices)/npoints**2
        surf.initial_vertices = surf.vertices.copy() - \
            np.repeat(xyz, surf.no_vertices_per_point, axis=0)
        return surf








Equations to be plotted


.. code-block:: default

    eq1 = "np.abs(np.sin(x*2*np.pi*np.cos(time/2)))**1*np.cos(time/2)*\
          np.abs(np.cos(y*2*np.pi*np.sin(time/2)))**1*np.sin(time/2)*1.2"
    eq2 = "((x**2 - y**2)/(x**2 + y**2))**(2)*np.cos(6*np.pi*x*y-1.8*time)*0.24"
    eq3 = "(np.sin(np.pi*2*x-np.sin(1.8*time))*np.cos(np.pi*2*y+np.cos(1.8*time)))\
          *0.48"
    eq4 = "np.cos(24*np.sqrt(x**2 + y**2) - 2*time)*0.18"
    equations = [eq1, eq2, eq3, eq4]







List of colormaps to be used for the various functions.


.. code-block:: default

    cmap_names = ['hot', 'plasma', 'viridis', 'ocean']







Creating a list of surfaces.


.. code-block:: default

    surfaces = []
    for i in range(4):
        surfaces.append(create_surface(x, y, equation=equations[i],
                        colormap_name=cmap_names[i]))






.. rst-class:: sphx-glr-script-out

 Out:

 .. code-block:: none

    /Users/koudoro/Software/fury/docs/examples/viz_animated_surfaces.py:34: RuntimeWarning: invalid value encountered in true_divide
      v /= np.max(np.abs(v), axis=0)



Creating a scene object and configuring the camera's position


.. code-block:: default


    scene = window.Scene()
    scene.set_camera(position=(4.45, -21, 12), focal_point=(4.45, 0.0, 0.0),
                     view_up=(0.0, 0.0, 1.0))
    showm = window.ShowManager(scene, size=(600, 600))







Creating a grid to interact with surfaces individually.


.. code-block:: default


    # To store the function names
    text = []
    for i in range(4):
        t_actor = actor.label('Function ' + str(i + 1), pos=(0, 0, 0),
                              scale=(0.17, 0.2, 0.2))
        t_actor.SetCamera(scene.camera())
        text.append(t_actor)

    grid_ui = ui.GridUI(actors=surfaces, captions=text,
                        caption_offset=(-0.7, -2.5, 0), dim=(1, 4),
                        cell_padding=2,
                        aspect_ratio=1,
                        rotation_axis=(0, 1, 0))
    showm.scene.add(grid_ui)

    # Adding an axes actor to the first surface.
    showm.scene.add(actor.axes())






.. rst-class:: sphx-glr-script-out

 Out:

 .. code-block:: none

    /Users/koudoro/Software/fury/docs/examples/viz_animated_surfaces.py:137: DeprecationWarning: Label function has been renamedvector_text

    * deprecated from version: 0.7.1
    * Will raise <class 'fury.deprecator.ExpiredDeprecationError'> as of version: 0.9.0
      scale=(0.17, 0.2, 0.2))



Initializing text box to print the title of the animation


.. code-block:: default

    tb = ui.TextBlock2D(bold=True, position=(200, 60))
    tb.message = "Animated 2D functions"
    scene.add(tb)







Initializing showm and counter


.. code-block:: default

    showm.initialize()
    counter = itertools.count()







end is used to decide when to end the animation


.. code-block:: default

    end = 200








The 2D functions are updated and rendered here.


.. code-block:: default


    def timer_callback(_obj, _event):
        global xyz, time
        time += dt
        cnt = next(counter)

        # updating the colors and vertices of the triangles used to form the
        # surfaces
        for surf in surfaces:
            xyz, colors = update_surface(x, y, equation=surf.equation,
                                         cmap_name=surf.cmap_name)
            utils.update_surface_actor_colors(surf, colors)
            surf.vertices[:] = surf.initial_vertices + \
                np.repeat(xyz, surf.no_vertices_per_point, axis=0)
            utils.update_actor(surf)

        showm.render()
        # to end the animation
        if cnt == end:
            showm.exit()








Run every 30 milliseconds


.. code-block:: default

    showm.add_timer_callback(True, 30, timer_callback)

    interactive = False
    if interactive:
        showm.start()

    window.record(showm.scene, size=(600, 600),
                  out_path="viz_animated_surfaces.png")



.. image:: /auto_examples/images/sphx_glr_viz_animated_surfaces_001.png
    :class: sphx-glr-single-img





.. rst-class:: sphx-glr-timing

   **Total running time of the script:** ( 0 minutes  1.147 seconds)


.. _sphx_glr_download_auto_examples_viz_animated_surfaces.py:


.. only :: html

 .. container:: sphx-glr-footer
    :class: sphx-glr-footer-example



  .. container:: sphx-glr-download

     :download:`Download Python source code: viz_animated_surfaces.py <viz_animated_surfaces.py>`



  .. container:: sphx-glr-download

     :download:`Download Jupyter notebook: viz_animated_surfaces.ipynb <viz_animated_surfaces.ipynb>`


.. only:: html

 .. rst-class:: sphx-glr-signature

    `Gallery generated by Sphinx-Gallery <https://sphinx-gallery.github.io>`_
