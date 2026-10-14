"""
Placeholder product photography for the HUG Atelier lookbook.

These are studio renders made in Blender (Cycles) so the prototype has
realistic imagery before the real photo shoot. Replace the files in
assets/products/ with real photographs whenever they are ready; nothing
else in the site depends on this script.

Usage (needs the `bpy` module, e.g. `pip install bpy` in a venv):
    python render.py --out ../../assets/products/_raw --only tidal-strand --scale 0.5 --samples 64
"""

import argparse
import math
import os
import random
import sys

import bpy
from mathutils import Vector, Euler

# ---------------------------------------------------------------- helpers ---

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = 0.015
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 10
    scene.cycles.glossy_bounces = 6
    scene.cycles.caustics_reflective = False
    scene.cycles.caustics_refractive = False
    scene.cycles.blur_glossy = 0.5
    scene.render.film_transparent = False
    vs = scene.view_settings
    for transform in ("Khronos PBR Neutral", "AgX"):
        try:
            vs.view_transform = transform
            break
        except TypeError:
            continue
    vs.exposure = -0.3
    scene.unit_settings.system = "METRIC"
    return scene


def hex_rgb(h, alpha=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, alpha)


def node(nt, kind, loc=(0, 0), **inputs):
    n = nt.nodes.new(kind)
    n.location = loc
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def principled(nt):
    return next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")


# -------------------------------------------------------------- materials ---

def mat_pearl(name="Pearl", body="#E4DDD2", blush="#E6D3CC", film=(320, 680), rough=0.22):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = principled(nt)
    info = node(nt, "ShaderNodeObjectInfo", (-900, 200))
    # body tint varies a little per pearl: creamy white to soft rose
    mix = node(nt, "ShaderNodeMix", (-500, 300))
    mix.data_type = "RGBA"
    mix.inputs[6].default_value = hex_rgb(body)
    mix.inputs[7].default_value = hex_rgb(blush)
    rnd = node(nt, "ShaderNodeMath", (-700, 300))
    rnd.operation = "MULTIPLY"
    rnd.inputs[1].default_value = 0.65
    nt.links.new(info.outputs["Random"], rnd.inputs[0])
    nt.links.new(rnd.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], p.inputs["Base Color"])
    # thin-film thickness varies per pearl for different overtones
    film_map = node(nt, "ShaderNodeMapRange", (-500, -100))
    film_map.inputs["To Min"].default_value = film[0]
    film_map.inputs["To Max"].default_value = film[1]
    nt.links.new(info.outputs["Random"], film_map.inputs["Value"])
    nt.links.new(film_map.outputs[0], p.inputs["Thin Film Thickness"])
    p.inputs["Thin Film IOR"].default_value = 1.62
    p.inputs["Roughness"].default_value = rough
    p.inputs["IOR"].default_value = 1.62
    p.inputs["Subsurface Weight"].default_value = 0.12
    p.inputs["Subsurface Radius"].default_value = (1.0, 0.85, 0.75)
    p.inputs["Subsurface Scale"].default_value = 0.08
    p.inputs["Coat Weight"].default_value = 1.0
    p.inputs["Coat Roughness"].default_value = 0.015
    p.inputs["Sheen Weight"].default_value = 0.12
    p.inputs["Sheen Tint"].default_value = hex_rgb("#F7E6EC")
    # faint growth-ring texture typical of freshwater pearls
    tex = node(nt, "ShaderNodeTexNoise", (-700, -400))
    tex.inputs["Scale"].default_value = 3.5
    tex.inputs["Detail"].default_value = 6.0
    bump = node(nt, "ShaderNodeBump", (-300, -400))
    bump.inputs["Strength"].default_value = 0.05
    bump.inputs["Distance"].default_value = 0.02
    nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def mat_silver(name="Silver", rough=0.14, tint="#E9E8E6"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = principled(m.node_tree)
    p.inputs["Base Color"].default_value = hex_rgb(tint)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = rough
    p.inputs["Anisotropic"].default_value = 0.2
    return m


def mat_surface(color, rough=0.85, grain=0.25, scale=180.0):
    m = bpy.data.materials.new("Surface")
    m.use_nodes = True
    nt = m.node_tree
    p = principled(nt)
    tex = node(nt, "ShaderNodeTexNoise", (-800, 0))
    tex.inputs["Scale"].default_value = scale
    tex.inputs["Detail"].default_value = 12.0
    tex.inputs["Roughness"].default_value = 0.6
    big = node(nt, "ShaderNodeTexNoise", (-800, 300))
    big.inputs["Scale"].default_value = 2.0
    ramp = node(nt, "ShaderNodeMix", (-400, 200))
    ramp.data_type = "RGBA"
    base = hex_rgb(color)
    darker = tuple(c * 0.86 for c in base[:3]) + (1.0,)
    ramp.inputs[6].default_value = darker
    ramp.inputs[7].default_value = base
    fac = node(nt, "ShaderNodeMapRange", (-600, 300))
    fac.inputs["From Min"].default_value = 0.35
    fac.inputs["From Max"].default_value = 0.65
    nt.links.new(big.outputs["Fac"], fac.inputs["Value"])
    nt.links.new(fac.outputs[0], ramp.inputs[0])
    nt.links.new(ramp.outputs[2], p.inputs["Base Color"])
    bump = node(nt, "ShaderNodeBump", (-300, -200))
    bump.inputs["Strength"].default_value = grain
    bump.inputs["Distance"].default_value = 0.05
    nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    p.inputs["Roughness"].default_value = rough
    return m


# ---------------------------------------------------------------- objects ---

_noise_tex = {}


def noise_texture(r):
    key = round(r, 2)
    if key not in _noise_tex:
        t = bpy.data.textures.new("Baroque", type="CLOUDS")
        t.noise_scale = r * 1.6
        t.noise_depth = 1
        _noise_tex[key] = t
    return _noise_tex[key]


def pearl(loc, r, mat, baroque=0.12, stretch=(1, 1, 1), rot=None, rest=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=r)
    ob = bpy.context.active_object
    ob.scale = stretch
    bpy.ops.object.shade_smooth()
    if baroque > 0:
        d = ob.modifiers.new("Displace", "DISPLACE")
        d.texture = noise_texture(r * max(stretch))
        d.texture_coords = "GLOBAL"
        d.strength = r * baroque
        d.mid_level = 0.5
    ob.rotation_euler = rot or Euler([random.uniform(0, math.tau) for _ in range(3)])
    z = loc[2] if len(loc) == 3 else (r * stretch[2] if rest else 0)
    ob.location = (loc[0], loc[1], z)
    ob.data.materials.append(mat)
    return ob


def tube(points, radius, mat, cyclic=False, resolution=24, name="Wire"):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 6
    cu.resolution_u = resolution
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY" if len(points) < 3 else "NURBS")
    sp.points.add(len(points) - 1)
    for i, p in enumerate(points):
        sp.points[i].co = (*p, 1.0)
    sp.use_endpoint_u = not cyclic
    sp.use_cyclic_u = cyclic
    sp.order_u = min(4, len(points))
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob


def torus(loc, major, minor, mat, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=64, minor_segments=24,
                                     location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.scale = scale
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    return ob


def bead(loc, r, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=loc)
    ob = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    return ob


def cylinder(loc, r, depth, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=r, depth=depth, location=loc, rotation=rot)
    ob = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    bev = ob.modifiers.new("Bevel", "BEVEL")
    bev.width = min(r, depth) * 0.25
    bev.segments = 4
    ob.data.materials.append(mat)
    return ob


def chain(path_pts, mat, link=0.11, wire=0.022, cyclic=False):
    """Cable chain: alternating perpendicular oval links along a path."""
    pts = resample(path_pts, link * 1.55, cyclic)
    for i in range(len(pts) - (0 if cyclic else 1)):
        a, b = Vector(pts[i]), Vector(pts[(i + 1) % len(pts)])
        mid = (a + b) / 2
        d = (b - a).normalized()
        yaw = math.atan2(d.y, d.x)
        pitch = -math.asin(max(-1, min(1, d.z)))
        roll = (math.pi / 2) if i % 2 else 0.0
        bpy.ops.mesh.primitive_torus_add(major_radius=link * 0.5, minor_radius=wire,
                                         major_segments=24, minor_segments=8)
        ob = bpy.context.active_object
        ob.scale = (1.45, 0.85, 1)
        ob.rotation_mode = "ZYX"
        ob.rotation_euler = (math.pi / 2 + roll, pitch, yaw)
        ob.location = mid
        bpy.ops.object.shade_smooth()
        ob.data.materials.append(mat)


def resample(points, step, cyclic=False):
    pts = [Vector(p) for p in points]
    if cyclic:
        pts.append(pts[0])
    dense = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        n = max(1, int((b - a).length / (step / 8)))
        for k in range(n):
            dense.append(a.lerp(b, k / n))
    dense.append(pts[-1])
    out = [dense[0]]
    acc = 0.0
    for i in range(1, len(dense)):
        acc += (dense[i] - dense[i - 1]).length
        if acc >= step:
            out.append(dense[i])
            acc = 0.0
    return [tuple(p) for p in out]


def place_along(points, radii, gap, cyclic=False):
    """Walk a polyline and return centres for beads of given radii."""
    pts = [Vector(p) for p in points]
    if cyclic:
        pts.append(pts[0])
    dense = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        n = max(1, int((b - a).length / 0.01))
        for k in range(n):
            dense.append(a.lerp(b, k / n))
    out, idx, prev_r = [], 0, None
    pos = dense[0]
    for r in radii:
        need = (r + prev_r + gap) if prev_r is not None else 0
        travelled = 0.0
        while travelled < need and idx < len(dense) - 1:
            travelled += (dense[idx + 1] - dense[idx]).length
            idx += 1
        if idx >= len(dense) - 1 and travelled < need:
            break
        out.append((dense[idx], r))
        prev_r = r
    return out


# ------------------------------------------------------------------ studio ---

def studio(surface="#EDE6DC", key=900, fill=180, rim=260, world="#4A4540", world_strength=0.5,
           key_angle=-35, surface_rough=0.85, grain=0.25):
    scene = bpy.context.scene
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.data.materials.append(mat_surface(surface, rough=surface_rough, grain=grain))

    w = bpy.data.worlds.new("World")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    bg.inputs["Strength"].default_value = world_strength
    # bright "sky" over a dark ground: pearls pick this up as a soft horizon line
    coord = node(nt, "ShaderNodeTexCoord", (-900, 0))
    xyz = node(nt, "ShaderNodeSeparateXYZ", (-700, 0))
    rng = node(nt, "ShaderNodeMapRange", (-500, 0))
    rng.inputs["From Min"].default_value = -0.05
    rng.inputs["From Max"].default_value = 0.45
    mix = node(nt, "ShaderNodeMix", (-300, 0))
    mix.data_type = "RGBA"
    mix.inputs[6].default_value = hex_rgb(world)
    mix.inputs[7].default_value = hex_rgb("#8F8880")
    nt.links.new(coord.outputs["Generated"], xyz.inputs[0])
    nt.links.new(xyz.outputs["Z"], rng.inputs["Value"])
    nt.links.new(rng.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], bg.inputs["Color"])

    def area(name, energy, size, loc, target=(0, 0, 0), shape="RECTANGLE", size_y=None, color="#FFFFFF"):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = energy * 16
        ld.shape = shape
        ld.size = size
        if size_y:
            ld.size_y = size_y
        ld.color = hex_rgb(color)[:3]
        ob = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(ob)
        ob.location = loc
        direction = Vector(target) - Vector(loc)
        ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        return ob

    flag = bpy.data.materials.new("Flag")
    flag.use_nodes = True
    principled(flag.node_tree).inputs["Base Color"].default_value = hex_rgb("#141210")
    principled(flag.node_tree).inputs["Roughness"].default_value = 1.0
    for x in (-26, 26):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, 6, 14), rotation=(0, math.radians(90), 0))
        f = bpy.context.active_object
        f.scale = (30, 40, 1)
        f.data.materials.append(flag)
        f.visible_camera = False
        f.visible_shadow = False

    a = math.radians(key_angle)
    area("Key", key, 10, (math.sin(a) * 22, -math.cos(a) * 22, 26), size_y=16, color="#FFF7EE")
    area("Fill", fill, 40, (32, 18, 24), color="#F4F2FF")
    area("Rim", rim, 10, (-6, 34, 22), size_y=40, color="#FFFFFF")
    return floor


def camera(loc, target, lens=85, fstop=4.0, focus=None):
    cd = bpy.data.cameras.new("Camera")
    cd.lens = lens
    cd.sensor_width = 36
    ob = bpy.data.objects.new("Camera", cd)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    direction = Vector(target) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    cd.dof.focus_distance = (Vector(focus or target) - Vector(loc)).length
    bpy.context.scene.camera = ob
    return ob


# ---------------------------------------------------------------- pieces ---

def tidal_strand():
    """Long strand of baroque pearls laid in a loose loop."""
    studio(surface="#DDD5CA", key=1200)
    pm = mat_pearl()
    sm = mat_silver()
    pts = []
    for i in range(240):
        t = i / 240 * math.tau
        x = 6.2 * math.sin(t) * (1 - 0.18 * math.cos(t))
        y = -8.0 * math.cos(t) * 0.92 + 1.4 * math.sin(2 * t) * 0.35 + 0.6
        # a soft dip at the bottom, as if the strand fell from a hand
        y -= 1.6 * max(0.0, math.cos(t)) ** 6
        pts.append((x, y, 0))
    radii = [random.uniform(0.42, 0.52) for _ in range(200)]
    beads = place_along(pts, radii, gap=0.06, cyclic=True)
    clasp_at = len(beads) // 2
    for i, (c, r) in enumerate(beads):
        if abs(i - clasp_at) <= 1:
            continue
        pearl((c.x, c.y), r, pm, baroque=0.3,
              stretch=(random.uniform(0.92, 1.08), random.uniform(0.92, 1.12), random.uniform(0.86, 1.0)))
    c, _ = beads[clasp_at]
    torus((c.x, c.y, 0.14), 0.36, 0.08, sm, scale=(1, 1.35, 1))
    bead((c.x, c.y + 0.75, 0.2), 0.2, sm)
    bead((c.x, c.y - 0.75, 0.2), 0.2, sm)
    camera((0.6, -6.0, 34), (0, -0.8, 0), lens=60, fstop=8)


def moon_drop():
    """Drop earrings: silver hook, bead, long baroque drop."""
    studio(surface="#D8CEC4", key=1000, key_angle=-50)
    pm = mat_pearl(blush="#F0D9D2", film=(300, 600))
    sm = mat_silver(rough=0.1)
    for side, (ox, oy, tilt) in enumerate(((-2.2, 0.6, 0.18), (2.0, -0.4, -0.12))):
        ca, sa = math.cos(tilt), math.sin(tilt)

        def T(x, y, z=0.0):
            return (ox + x * ca - y * sa, oy + x * sa + y * ca, z)

        hook = [T(0, 5.4, 0.06), T(0.0, 6.6, 0.06), T(0.9, 7.5, 0.06), T(1.9, 7.0, 0.06),
                T(2.1, 5.7, 0.06), T(1.9, 3.9, 0.06), T(1.6, 2.8, 0.06)]
        tube(hook, 0.055, sm)
        bead(T(0, 5.1, 0.17), 0.17, sm)
        cylinder(T(0, 4.6, 0.12), 0.11, 0.35, sm, rot=(math.pi / 2, 0, tilt))
        pearl(T(0, 2.4)[:2], 0.95, pm, baroque=0.32,
              stretch=(1.0, 1.75, 0.9), rot=Euler((0, 0, tilt + random.uniform(-0.1, 0.1))))
    camera((3.5, -14, 40), (0, 2.6, 0), lens=85, fstop=4.5)


def halo_ring():
    """Single pearl on a slim silver band, standing."""
    studio(surface="#DCCBC3", key=900, key_angle=-25)
    pm = mat_pearl(body="#F5EFE7", film=(380, 560), rough=0.12)
    sm = mat_silver(rough=0.09)
    band = torus((0, 0, 1.05), 0.95, 0.075, sm, rot=(math.radians(90), 0, math.radians(32)),
                 scale=(1, 1, 1.15))
    # prongs / cup
    cup_z = 2.2
    cylinder((0, 0, cup_z - 0.1), 0.22, 0.2, sm)
    pearl((0, 0, cup_z + 0.5), 0.55, pm, baroque=0.1, stretch=(1, 1, 0.96))
    camera((6.5, -15.5, 6.0), (0, 0, 1.55), lens=100, fstop=2.8)


def shoreline_bracelet():
    """Circle of pearls with silver spacers."""
    studio(surface="#CFC5B8", key=1050, key_angle=-30)
    pm = mat_pearl(film=(240, 500))
    sm = mat_silver()
    pts = [(3.4 * math.cos(t), 3.2 * math.sin(t), 0) for t in [i / 120 * math.tau for i in range(120)]]
    seq = []
    for i in range(40):
        seq.append(("p", random.uniform(0.38, 0.46)))
        seq.append(("s", 0.11))
    placed = place_along(pts, [r for _, r in seq], gap=0.02, cyclic=True)
    for (kind, _), (c, r) in zip(seq, placed):
        if kind == "p":
            pearl((c.x, c.y), r, pm, baroque=0.3,
                  stretch=(random.uniform(0.9, 1.1), random.uniform(0.9, 1.1), random.uniform(0.85, 1)))
        else:
            bead((c.x, c.y, r), r, sm)
    camera((0.4, -4.5, 21), (0, 0, 0), lens=70, fstop=7)


def selene_pendant():
    """Coin pearl on a fine cable chain, on dark slate."""
    studio(surface="#2B2927", key=1300, fill=90, rim=380, world="#2A2826", world_strength=0.08,
           surface_rough=0.6, grain=0.35)
    pm = mat_pearl(body="#F4EEE6", film=(320, 600), rough=0.14)
    sm = mat_silver(rough=0.12)
    path = []
    for i in range(200):
        t = i / 199
        ang = math.pi * (0.15 + 0.7 * t)
        path.append((7.5 * math.cos(ang) * (1.0 + 0.1 * math.sin(3 * ang)), 11.5 * math.sin(ang) - 6.2, 0.035))
    left, right = path[:100], path[100:]
    chain(left + [(0.0, -6.0, 0.035)], sm, link=0.13, wire=0.026)
    chain([(0.0, -6.0, 0.035)] + right, sm, link=0.13, wire=0.026)
    torus((0, -6.4, 0.06), 0.24, 0.05, sm, rot=(0, 0, 0))
    cylinder((0, -6.95, 0.2), 0.16, 0.5, sm, rot=(math.pi / 2, 0, 0))
    pearl((0, -8.6), 1.35, pm, baroque=0.38, stretch=(1.0, 1.05, 0.48), rot=Euler((0, 0, 0.4)))
    camera((0.8, -12.5, 30), (0, -4.6, 0), lens=70, fstop=5.6)


def petal_studs():
    """Pair of cluster studs, macro."""
    studio(surface="#E3DBD1", key=950, key_angle=-40)
    pm = mat_pearl(blush="#F3DAD8", film=(260, 520))
    sm = mat_silver(rough=0.1)
    for ox, oy, rz in ((-1.35, 0.3, 0.3), (1.45, -0.55, -0.9)):
        cylinder((ox, oy, 0.08), 0.75, 0.12, sm)
        for k in range(5):
            a = rz + k / 5 * math.tau
            pearl((ox + 0.5 * math.cos(a), oy + 0.5 * math.sin(a), 0.42), random.uniform(0.32, 0.38), pm,
                  baroque=0.28, stretch=(1, 1, 0.9))
        pearl((ox, oy, 0.72), 0.33, pm, baroque=0.1)
    camera((2.6, -10.5, 10.5), (0, -0.1, 0.3), lens=100, fstop=4.0)


def undertow_lariat():
    """Y-necklace: chain with stationed pearls and a long drop."""
    studio(surface="#D6CDC1", key=1100, key_angle=-30)
    pm = mat_pearl(film=(280, 560))
    sm = mat_silver()
    left, right = [], []
    for i in range(80):
        t = i / 79
        ang = math.pi * (0.92 - 0.42 * t)
        left.append((-1.0 + 8.0 * math.cos(ang) * (1 - t * 0.0), 4.5 + 6.0 * math.sin(ang) - 6.0 * t, 0.03))
    for i in range(80):
        t = i / 79
        ang = math.pi * (0.08 + 0.42 * t)
        right.append((1.0 + 8.0 * math.cos(ang), 4.5 + 6.0 * math.sin(ang) - 6.0 * t, 0.03))
    junction = (0.0, -2.2, 0.03)
    left = left + [junction]
    right = list(reversed(right))
    right = [junction] + right
    chain(left, sm, link=0.12, wire=0.024)
    chain(right, sm, link=0.12, wire=0.024)
    for path in (left, right):
        for frac in (0.25, 0.55, 0.82):
            p = path[int(frac * (len(path) - 1))]
            pearl((p[0], p[1]), 0.36, pm, baroque=0.26)
    drop = [junction, (0.15, -4.0, 0.03), (0.05, -6.0, 0.03), (0.2, -7.6, 0.03)]
    chain(drop, sm, link=0.12, wire=0.024)
    pearl((0, -2.2), 0.42, pm, baroque=0.12)
    pearl((0.25, -8.6), 0.85, pm, baroque=0.34, stretch=(1, 1.4, 0.85), rot=Euler((0, 0, 0.1)))
    camera((0.4, -5.5, 30), (0, -1.6, 0), lens=60, fstop=8)


def tidal_detail():
    """Macro of the strand: luster close-up."""
    tidal_strand()
    cam = bpy.context.scene.camera
    cam.location = (-1.2, -14.2, 10.5)
    target = Vector((-3.4, -5.8, 0.4))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = 100
    cam.data.dof.aperture_fstop = 2.0
    cam.data.dof.focus_distance = (target - cam.location).length


PIECES = {
    "tidal-strand": tidal_strand,
    "tidal-strand-detail": tidal_detail,
    "moon-drop": moon_drop,
    "halo-ring": halo_ring,
    "shoreline-bracelet": shoreline_bracelet,
    "selene-pendant": selene_pendant,
    "petal-studs": petal_studs,
    "undertow-lariat": undertow_lariat,
}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--samples", type=int, default=160)
    args = ap.parse_args(argv)
    os.makedirs(args.out, exist_ok=True)
    for slug, build in PIECES.items():
        if args.only and slug not in args.only:
            continue
        random.seed(slug)
        global _noise_tex
        _noise_tex = {}
        scene = reset()
        build()
        scene.render.resolution_x = int(1600 * args.scale)
        scene.render.resolution_y = int(2000 * args.scale)
        scene.cycles.samples = args.samples
        scene.render.image_settings.file_format = "PNG"
        scene.render.image_settings.color_depth = "16"
        scene.render.filepath = os.path.join(args.out, f"{slug}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", slug, flush=True)


if __name__ == "__main__":
    main()
