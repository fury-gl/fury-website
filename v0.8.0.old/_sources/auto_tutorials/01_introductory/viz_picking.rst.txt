.. note::
    :class: sphx-glr-download-link-note

    Click :ref:`here <sphx_glr_download_auto_tutorials_01_introductory_viz_picking.py>` to download the full example code
.. rst-class:: sphx-glr-example-title

.. _sphx_glr_auto_tutorials_01_introductory_viz_picking.py:


=====================
Simple picking
=====================

Here we present a tutorial showing how to interact with objects in the
3D world. All objects to be picked are part of a single actor.
FURY likes to bundle objects in a few actors to reduce code and
increase speed.

When the objects will be picked they will change size and color.


.. code-block:: default


    import numpy as np
    from fury import actor, window, ui, utils, pick

    centers = 0.5 * np.array([[0, 0, 0], [100, 0, 0], [200, 0, 0.]])
    colors = np.array([[0.8, 0, 0], [0, 0.8, 0], [0, 0, 0.8]])
    radii = 0.1 * np.array([50, 100, 150.])

    selected = np.zeros(3, dtype=bool)







Let's create a panel to show what is picked


.. code-block:: default


    panel = ui.Panel2D(size=(400, 200), color=(1, .5, .0), align="right")
    panel.center = (150, 200)

    text_block = ui.TextBlock2D(text="Left click on object \n")
    panel.add_element(text_block, (0.3, 0.3))







Build scene and add an actor with many objects.


.. code-block:: default


    scene = window.Scene()

    label_actor = actor.label(text='Test')





.. rst-class:: sphx-glr-script-out

 Out:

 .. code-block:: none

    /Users/koudoro/Software/fury/docs/tutorials/01_introductory/viz_picking.py:38: DeprecationWarning: Label function has been renamedvector_text

    * deprecated from version: 0.7.1
    * Will raise <class 'fury.deprecator.ExpiredDeprecationError'> as of version: 0.9.0
      label_actor = actor.label(text='Test')



This actor is made with 3 cubes of different orientation


.. code-block:: default


    directions = np.array([[np.sqrt(2)/2, 0, np.sqrt(2)/2],
                           [np.sqrt(2)/2, np.sqrt(2)/2, 0],
                           [0, np.sqrt(2)/2, np.sqrt(2)/2]])
    fury_actor = actor.cube(centers, directions, colors, heights=radii)





.. rst-class:: sphx-glr-script-out

 Out:

 .. code-block:: none

    /Users/koudoro/Software/fury/docs/tutorials/01_introductory/viz_picking.py:46: ArgsDeprecationWarning: "heights" was deprecated

    * deprecated from version: 0.6
    * Will raise <class 'fury.deprecator.ExpiredDeprecationError'> as of version: 0.8
    * Use argument "scales" instead.
      fury_actor = actor.cube(centers, directions, colors, heights=radii)



Access the memory of the vertices of all the cubes


.. code-block:: default


    vertices = utils.vertices_from_actor(fury_actor)
    num_vertices = vertices.shape[0]
    num_objects = centers.shape[0]







Access the memory of the colors of all the cubes


.. code-block:: default


    vcolors = utils.colors_from_actor(fury_actor, 'colors')







Adding an actor showing the axes of the world coordinates


.. code-block:: default

    ax = actor.axes(scale=(10, 10, 10))

    scene.add(fury_actor)
    scene.add(label_actor)
    scene.add(ax)
    scene.reset_camera()







Create the Picking manager


.. code-block:: default


    pickm = pick.PickingManager()







Time to make the callback which will be called when we pick an object


.. code-block:: default



    def left_click_callback(obj, event):

        # Get the event position on display and pick

        event_pos = pickm.event_position(showm.iren)
        picked_info = pickm.pick(event_pos, showm.scene)

        vertex_index = picked_info['vertex']

        # Calculate the objects index

        object_index = int(np.floor((vertex_index / num_vertices) *
                              num_objects))

        # Find how many vertices correspond to each object
        sec = int(num_vertices / num_objects)

        if not selected[object_index]:
            scale = 6/5
            color_add = np.array([30, 30, 30], dtype='uint8')
            selected[object_index] = True
        else:
            scale = 5/6
            color_add = np.array([-30, -30, -30], dtype='uint8')
            selected[object_index] = False

        # Update vertices positions
        vertices[object_index * sec: object_index * sec + sec] = scale * \
            (vertices[object_index * sec: object_index * sec + sec] -
             centers[object_index]) + centers[object_index]

        # Update colors
        vcolors[object_index * sec: object_index * sec + sec] += color_add

        # Tell actor that memory is modified
        utils.update_actor(fury_actor)

        face_index = picked_info['face']

        # Show some info
        text = 'Object ' + str(object_index) + '\n'
        text += 'Vertex ID ' + str(vertex_index) + '\n'
        text += 'Face ID ' + str(face_index) + '\n'
        text += 'World pos ' + str(np.round(picked_info['xyz'], 2)) + '\n'
        text += 'Actor ID ' + str(id(picked_info['actor']))
        text_block.message = text
        showm.render()








Bind the callback to the actor


.. code-block:: default


    fury_actor.AddObserver('LeftButtonPressEvent', left_click_callback, 1)







Make the window appear


.. code-block:: default


    showm = window.ShowManager(scene, size=(1024, 768), order_transparent=True)
    showm.initialize()
    scene.add(panel)







Change interactive to True to start interacting with the scene


.. code-block:: default


    interactive = False

    if interactive:

        showm.start()








Save the current framebuffer in a PNG file


.. code-block:: default


    window.record(showm.scene, size=(1024, 768), out_path="viz_picking.png")



.. image:: /auto_tutorials/01_introductory/images/sphx_glr_viz_picking_001.png
    :class: sphx-glr-single-img





.. rst-class:: sphx-glr-timing

   **Total running time of the script:** ( 0 minutes  0.187 seconds)


.. _sphx_glr_download_auto_tutorials_01_introductory_viz_picking.py:


.. only :: html

 .. container:: sphx-glr-footer
    :class: sphx-glr-footer-example



  .. container:: sphx-glr-download

     :download:`Download Python source code: viz_picking.py <viz_picking.py>`



  .. container:: sphx-glr-download

     :download:`Download Jupyter notebook: viz_picking.ipynb <viz_picking.ipynb>`


.. only:: html

 .. rst-class:: sphx-glr-signature

    `Gallery generated by Sphinx-Gallery <https://sphinx-gallery.github.io>`_
