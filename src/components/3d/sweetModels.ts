import * as THREE from 'three';

export type SweetModelType =
  | 'rasgulla'
  | 'gulab_jamun'
  | 'sandesh'
  | 'kaju_katli'
  | 'laddu'
  | 'mishti_doi'
  | 'sweet_box'
  | 'mithai_thali';

export interface Sweet3DMeta {
  id: SweetModelType;
  nameEn: string;
  nameBn: string;
  taglineEn: string;
  taglineBn: string;
  calories: number;
  sugar: number;
  protein: number;
  pureChhenaRatio: string;
  shelfLife: string;
  origin: string;
}

export const SWEET_3D_CATALOG: Record<SweetModelType, Sweet3DMeta> = {
  rasgulla: {
    id: 'rasgulla',
    nameEn: 'Sponge Rasgulla',
    nameBn: 'স্পঞ্জ রসগোল্লা',
    taglineEn: 'Spongy chhena sphere immersed in aromatic light sugar syrup',
    taglineBn: 'খাঁটি ছানার নরম তুলতুলে রসগোল্লা সুগন্ধি রসে ডুবানো',
    calories: 125,
    sugar: 18,
    protein: 4.2,
    pureChhenaRatio: '98% Cow Milk Chhena',
    shelfLife: '3 Days (Chilled)',
    origin: 'Bengal Heritage Heritage Recipe'
  },
  gulab_jamun: {
    id: 'gulab_jamun',
    nameEn: 'Shahi Gulab Jamun',
    nameBn: 'শাহী গোলাপ জামুন',
    taglineEn: 'Deep golden-caramel sphere glazed in saffron rose syrup',
    taglineBn: 'খাঁটি ক্ষীর ও খোয়া ক্ষীরের রসে ভেজা লালমোহন গোলাপ জামুন',
    calories: 168,
    sugar: 22,
    protein: 3.8,
    pureChhenaRatio: 'Pure Mawa & Cow Milk Chhena',
    shelfLife: '4 Days (Ambient/Chilled)',
    origin: 'Royal Darbar Confectionery'
  },
  sandesh: {
    id: 'sandesh',
    nameEn: 'Nolen Gur & Kacha Golla Sandesh',
    nameBn: 'নলেন গুড়ের কাঁচাগোল্লা সন্দেশ',
    taglineEn: 'Delicately carved chhena medallion with saffron & pistachio',
    taglineBn: 'নলেন গুড় ও খাঁটি ছানার শৈল্পিক কারুকাজ করা ঐতিহ্যবাহী সন্দেশ',
    calories: 110,
    sugar: 12,
    protein: 5.6,
    pureChhenaRatio: '100% Pure Cow Milk Chhena',
    shelfLife: '2 Days (Fresh Consumption)',
    origin: 'Kaliachak Artisanal Special'
  },
  kaju_katli: {
    id: 'kaju_katli',
    nameEn: 'Royal Kaju Katli (Barfi)',
    nameBn: 'শাহী কাজু বরফি',
    taglineEn: 'Diamond-cut Goan cashew fudge with pure silver vark',
    taglineBn: 'রুপোলি তবক মোড়া প্রিমিয়াম কাজু বাদামের বরফি',
    calories: 145,
    sugar: 14,
    protein: 4.5,
    pureChhenaRatio: '100% Premium Cashew Nut Paste',
    shelfLife: '15 Days',
    origin: 'Festive Royal Confection'
  },
  laddu: {
    id: 'laddu',
    nameEn: 'Desi Ghee Motichoor Laddoo',
    nameBn: 'ঘিয়ে ভাজা মতিচুর লাড্ডু',
    taglineEn: 'Golden micro-pearl boondi bound with pure desi cow ghee & saffron',
    taglineBn: 'খাঁটি দেশি ঘি, পেস্তা ও জাফরানে তৈরি নরম রসালে মতিচুর লাড্ডু',
    calories: 185,
    sugar: 20,
    protein: 3.2,
    pureChhenaRatio: 'Pure Desi Ghee & Gram Flour',
    shelfLife: '7 Days',
    origin: 'Temple & Festival Tradition'
  },
  mishti_doi: {
    id: 'mishti_doi',
    nameEn: 'Traditional Terracotta Mishti Doi',
    nameBn: 'মাটির ভাঁড়ের ঐতিহ্যবাহী মিষ্টি দই',
    taglineEn: 'Slow-caramelized thick red curd in porous earthen clay pot',
    taglineBn: 'পোড়ামাটির হাঁড়িতে খাঁটি ঘন দুধের লাল মিষ্টি দই',
    calories: 160,
    sugar: 16,
    protein: 6.8,
    pureChhenaRatio: 'Rich Cow Milk Curd with Jaggery',
    shelfLife: '5 Days (Refrigerated)',
    origin: 'Malda & Bengal Heritage'
  },
  sweet_box: {
    id: 'sweet_box',
    nameEn: 'Ghosh Royal Heritage Sweet Box',
    nameBn: 'ঘোষ রাজকীয় মিষ্টি গিফট বক্স',
    taglineEn: 'Luxury embossed gift assortment containing Bengal signature sweets',
    taglineBn: 'বিবাহ ও উৎসবের জন্য রাজকীয় সোনালী উপহার মিষ্টির বাক্স',
    calories: 450,
    sugar: 45,
    protein: 12,
    pureChhenaRatio: 'Assortment of Pure Sweets',
    shelfLife: '5-7 Days',
    origin: 'Ghosh Sweet House Signature'
  },
  mithai_thali: {
    id: 'mithai_thali',
    nameEn: 'Grand Brass Mithai Thali',
    nameBn: 'ঐতিহ্যবাহী পিতলের মিষ্টি থালা',
    taglineEn: 'Ornate celebratory brass platter loaded with royal sweet confections',
    taglineBn: 'পূজা ও আনন্দানুষ্ঠানের সাজানো পিতলের মিষ্টি থালা',
    calories: 520,
    sugar: 50,
    protein: 14,
    pureChhenaRatio: 'Complete Sweet Tasting Collection',
    shelfLife: '4 Days',
    origin: 'Bengal Festive Utsav'
  }
};

/**
 * Creates 3D procedural meshes for authentic Indian sweets using Three.js
 */
export function buildSweet3DModel(type: SweetModelType): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'rasgulla': {
      // 1. Spongy white/cream chhena ball
      const sphereGeo = new THREE.SphereGeometry(1.4, 48, 48);
      
      // Slightly perturb vertices to give organic, hand-rolled spongy texture
      const pos = sphereGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const w = pos.getZ(i);
        const noise = (Math.sin(u * 8) + Math.cos(v * 8) + Math.sin(w * 8)) * 0.025;
        pos.setXYZ(i, u * (1 + noise), v * (1 + noise), w * (1 + noise));
      }
      sphereGeo.computeVertexNormals();

      const chhenaMat = new THREE.MeshPhysicalMaterial({
        color: 0xfffcf2,
        roughness: 0.35,
        metalness: 0.05,
        transmission: 0.15, // syrupy translucency
        ior: 1.34,
        reflectivity: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15
      });
      const rasgullaMesh = new THREE.Mesh(sphereGeo, chhenaMat);
      rasgullaMesh.castShadow = true;
      rasgullaMesh.receiveShadow = true;
      group.add(rasgullaMesh);

      // Saffron strand garnish on top
      const saffronCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2, 1.41, -0.1),
        new THREE.Vector3(0.0, 1.45, 0.05),
        new THREE.Vector3(0.25, 1.39, 0.15)
      ]);
      const saffronGeo = new THREE.TubeGeometry(saffronCurve, 16, 0.025, 8, false);
      const saffronMat = new THREE.MeshStandardMaterial({
        color: 0xd9531e,
        roughness: 0.4
      });
      const saffronMesh = new THREE.Mesh(saffronGeo, saffronMat);
      group.add(saffronMesh);

      // Cardamom dust speckles
      const speckleGeo = new THREE.SphereGeometry(0.03, 6, 6);
      const speckleMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 });
      for (let i = 0; i < 12; i++) {
        const speck = new THREE.Mesh(speckleGeo, speckleMat);
        const angle = (i / 12) * Math.PI * 2;
        const r = 0.4 + Math.sin(i) * 0.2;
        speck.position.set(Math.cos(angle) * r, 1.35 + Math.cos(i * 2) * 0.05, Math.sin(angle) * r);
        group.add(speck);
      }

      // Syrupy glossy droplet ring beneath
      const syrupGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.15, 32);
      const syrupMat = new THREE.MeshPhysicalMaterial({
        color: 0xffeedd,
        transparent: true,
        opacity: 0.45,
        roughness: 0.05,
        transmission: 0.8,
        ior: 1.33
      });
      const syrupMesh = new THREE.Mesh(syrupGeo, syrupMat);
      syrupMesh.position.y = -1.2;
      group.add(syrupMesh);
      break;
    }

    case 'gulab_jamun': {
      // 1. Deep roasted golden-brown caramel sphere
      const sphereGeo = new THREE.SphereGeometry(1.4, 48, 48);
      const jamunMat = new THREE.MeshPhysicalMaterial({
        color: 0x4a1f0a, // deep caramelized golden-brown
        roughness: 0.22,
        metalness: 0.08,
        clearcoat: 0.9, // hot glistening sugar syrup coat
        clearcoatRoughness: 0.08,
        reflectivity: 0.8
      });
      const jamunMesh = new THREE.Mesh(sphereGeo, jamunMat);
      jamunMesh.castShadow = true;
      jamunMesh.receiveShadow = true;
      group.add(jamunMesh);

      // Pistachio slivers topping
      const pistaGeo = new THREE.BoxGeometry(0.12, 0.03, 0.35);
      const pistaMat = new THREE.MeshStandardMaterial({
        color: 0x558b2f,
        roughness: 0.4
      });
      for (let i = 0; i < 8; i++) {
        const pista = new THREE.Mesh(pistaGeo, pistaMat);
        const rad = 0.25 + (i % 3) * 0.15;
        const theta = (i / 8) * Math.PI * 2;
        pista.position.set(Math.cos(theta) * rad, 1.38, Math.sin(theta) * rad);
        pista.rotation.y = theta + 0.3;
        pista.rotation.x = 0.1;
        group.add(pista);
      }

      // Edible silver leaf shimmer patch
      const varkGeo = new THREE.CircleGeometry(0.4, 16);
      const varkMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        metalness: 0.95,
        roughness: 0.15,
        side: THREE.DoubleSide
      });
      const varkMesh = new THREE.Mesh(varkGeo, varkMat);
      varkMesh.rotation.x = -Math.PI / 2 + 0.2;
      varkMesh.position.set(0.1, 1.41, 0.1);
      group.add(varkMesh);

      // Amber syrup puddle beneath
      const syrupGeo = new THREE.CylinderGeometry(1.7, 1.9, 0.15, 32);
      const syrupMat = new THREE.MeshPhysicalMaterial({
        color: 0xd97706,
        transparent: true,
        opacity: 0.5,
        roughness: 0.05,
        transmission: 0.85,
        ior: 1.35
      });
      const syrupMesh = new THREE.Mesh(syrupGeo, syrupMat);
      syrupMesh.position.y = -1.25;
      group.add(syrupMesh);
      break;
    }

    case 'sandesh': {
      // Artisanal Bengali carved flower/conch shaped Sandesh
      // Main scalloped body
      const cylinderGeo = new THREE.CylinderGeometry(1.5, 1.4, 0.75, 8);
      const sandeshMat = new THREE.MeshStandardMaterial({
        color: 0xfff3d6, // warm chhena & nolen gur pale tint
        roughness: 0.7,
        metalness: 0.0
      });
      const sandeshBase = new THREE.Mesh(cylinderGeo, sandeshMat);
      sandeshBase.castShadow = true;
      group.add(sandeshBase);

      // Stamped floral medallion dome on top
      const domeGeo = new THREE.CylinderGeometry(1.1, 1.3, 0.25, 16);
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0xf7e1b5,
        roughness: 0.65
      });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = 0.45;
      group.add(domeMesh);

      // Center saffron depression with nolen gur glaze
      const centerGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.1, 16);
      const centerMat = new THREE.MeshPhysicalMaterial({
        color: 0xc26105, // rich nolen gur drop
        roughness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1
      });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      centerMesh.position.y = 0.58;
      group.add(centerMesh);

      // Green Pistachio halved on center
      const pistaNutGeo = new THREE.SphereGeometry(0.18, 12, 12);
      pistaNutGeo.scale(1, 0.5, 1.6);
      const pistaNutMat = new THREE.MeshStandardMaterial({
        color: 0x4d7c0f,
        roughness: 0.4
      });
      const pistaNut = new THREE.Mesh(pistaNutGeo, pistaNutMat);
      pistaNut.position.set(0, 0.66, 0);
      group.add(pistaNut);

      // Delicate saffron strands
      const saffronGeo = new THREE.BoxGeometry(0.04, 0.02, 0.4);
      const saffronMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      const saffron = new THREE.Mesh(saffronGeo, saffronMat);
      saffron.position.set(0.2, 0.66, 0.1);
      saffron.rotation.y = 0.8;
      group.add(saffron);
      break;
    }

    case 'kaju_katli': {
      // Iconic Diamond / Rhombus Cut Cashew Barfi
      const shape = new THREE.Shape();
      const w = 1.4;
      const h = 0.9;
      shape.moveTo(0, h);
      shape.lineTo(w, 0);
      shape.lineTo(0, -h);
      shape.lineTo(-w, 0);
      shape.closePath();

      const extrudeSettings = {
        depth: 0.35,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();

      // Creamy Cashew paste material
      const kajuMat = new THREE.MeshStandardMaterial({
        color: 0xfdfbf7,
        roughness: 0.55,
        metalness: 0.02
      });

      // Silver Vark metallic top face material
      const varkFaceMat = new THREE.MeshPhysicalMaterial({
        color: 0xf0f0f0,
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 0.5
      });

      const kajuMesh = new THREE.Mesh(geometry, [kajuMat, varkFaceMat]);
      kajuMesh.rotation.x = Math.PI / 2;
      kajuMesh.castShadow = true;
      group.add(kajuMesh);

      // Add a second stacked piece slightly offset for realistic presentation
      const secondGeometry = geometry.clone();
      const secondKaju = new THREE.Mesh(secondGeometry, [kajuMat, varkFaceMat]);
      secondKaju.rotation.x = Math.PI / 2;
      secondKaju.rotation.z = 0.35;
      secondKaju.position.set(0.4, -0.4, 0.1);
      secondKaju.castShadow = true;
      group.add(secondKaju);
      break;
    }

    case 'laddu': {
      // Motichoor Laddoo composed of clustered golden boondi spheres
      const coreSphereGeo = new THREE.SphereGeometry(1.25, 24, 24);
      const ladduMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // deep kesariya golden orange
        roughness: 0.5,
        metalness: 0.08
      });
      const coreMesh = new THREE.Mesh(coreSphereGeo, ladduMat);
      group.add(coreMesh);

      // Micro-pearl boondi spheres scattered on outer shell
      const boondiGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const boondiColorA = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35 });
      const boondiColorB = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      const melonSeedMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });
      const pistaCrumbMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.4 });

      const numPearls = 55;
      for (let i = 0; i < numPearls; i++) {
        const phi = Math.acos(-1 + (2 * i) / numPearls);
        const theta = Math.sqrt(numPearls * Math.PI) * phi;
        const r = 1.25 + (Math.sin(i * 3) * 0.04);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        let mat = i % 2 === 0 ? boondiColorA : boondiColorB;
        if (i % 9 === 0) mat = melonSeedMat;
        if (i % 11 === 0) mat = pistaCrumbMat;

        const pearl = new THREE.Mesh(boondiGeo, mat);
        pearl.position.set(x, y, z);
        group.add(pearl);
      }

      // Silver vark speck on top
      const varkDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.15 })
      );
      varkDisc.rotation.x = -Math.PI / 2;
      varkDisc.position.set(0, 1.35, 0);
      group.add(varkDisc);
      break;
    }

    case 'mishti_doi': {
      // Authentic Terracotta Earthen Handi (মাটির ভাঁড়)
      // 1. Terracotta Pot Body (curved earthen pot)
      const potPoints: THREE.Vector2[] = [];
      potPoints.push(new THREE.Vector2(0.0, -1.5));
      potPoints.push(new THREE.Vector2(0.9, -1.5));
      potPoints.push(new THREE.Vector2(1.55, -0.6));
      potPoints.push(new THREE.Vector2(1.65, 0.2));
      potPoints.push(new THREE.Vector2(1.4, 0.9));
      potPoints.push(new THREE.Vector2(1.5, 1.05)); // pot rim lip
      potPoints.push(new THREE.Vector2(1.35, 1.15)); // inner rim top
      potPoints.push(new THREE.Vector2(1.2, 0.9));

      const potGeo = new THREE.LatheGeometry(potPoints, 36);
      const terracottaMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412, // rustic red terracotta clay
        roughness: 0.85,
        metalness: 0.02
      });
      const potMesh = new THREE.Mesh(potGeo, terracottaMat);
      potMesh.castShadow = true;
      potMesh.receiveShadow = true;
      group.add(potMesh);

      // Traditional earthen incised ring markings on pot belly
      const ringGeo = new THREE.TorusGeometry(1.6, 0.04, 8, 36);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.9 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.15;
      group.add(ringMesh);

      // 2. Thick Caramelized Curd Surface inside pot (লাল মিষ্টি দইয়ের সর)
      const curdGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.1, 32);
      const curdMat = new THREE.MeshPhysicalMaterial({
        color: 0xc87d46, // caramelized baked curd top skin
        roughness: 0.35,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2
      });
      const curdMesh = new THREE.Mesh(curdGeo, curdMat);
      curdMesh.position.y = 0.92;
      group.add(curdMesh);

      // Saffron strand and cardamom on curd top
      const saffronGarnish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 })
      );
      saffronGarnish.rotation.z = Math.PI / 3;
      saffronGarnish.position.set(0.1, 0.98, 0.05);
      group.add(saffronGarnish);
      break;
    }

    case 'sweet_box': {
      // Royal Ghosh Sweet House Festive Embossed Sweet Box
      // Base Box
      const boxBaseGeo = new THREE.BoxGeometry(3.0, 0.7, 2.2);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x78350f, // rich royal crimson-amber
        roughness: 0.4,
        metalness: 0.25
      });
      const boxBase = new THREE.Mesh(boxBaseGeo, boxMat);
      boxBase.position.y = -0.35;
      boxBase.castShadow = true;
      group.add(boxBase);

      // Gold Trim / Embossed border
      const trimGeo = new THREE.BoxGeometry(3.05, 0.08, 2.25);
      const goldTrimMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.25
      });
      const trimMesh = new THREE.Mesh(trimGeo, goldTrimMat);
      trimMesh.position.y = 0.02;
      group.add(trimMesh);

      // Lid angled open
      const lidGeo = new THREE.BoxGeometry(3.05, 0.15, 2.25);
      const lidMesh = new THREE.Mesh(lidGeo, boxMat);
      lidMesh.position.set(0, 0.7, -1.2);
      lidMesh.rotation.x = -Math.PI / 4;
      lidMesh.castShadow = true;
      group.add(lidMesh);

      // Inside: 6 compartment dividers
      const sweetsInside = [
        { type: 'rasgulla', x: -0.9, z: -0.5 },
        { type: 'gulab_jamun', x: 0.0, z: -0.5 },
        { type: 'sandesh', x: 0.9, z: -0.5 },
        { type: 'kaju_katli', x: -0.9, z: 0.5 },
        { type: 'laddu', x: 0.0, z: 0.5 },
        { type: 'rasgulla', x: 0.9, z: 0.5 }
      ];

      sweetsInside.forEach((item) => {
        const miniSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 16, 16),
          new THREE.MeshStandardMaterial({
            color: item.type === 'gulab_jamun' ? 0x5a230d : item.type === 'laddu' ? 0xf59e0b : 0xfffaed,
            roughness: 0.3
          })
        );
        miniSphere.position.set(item.x, 0.18, item.z);
        group.add(miniSphere);
      });
      break;
    }

    case 'mithai_thali': {
      // Ornate Brass Platter (পিতলের থালা)
      const thaliPlateGeo = new THREE.CylinderGeometry(2.5, 2.3, 0.15, 48);
      const brassMat = new THREE.MeshPhysicalMaterial({
        color: 0xd97706, // gleaming royal Indian brass gold
        metalness: 0.8,
        roughness: 0.25,
        clearcoat: 0.5
      });
      const thaliMesh = new THREE.Mesh(thaliPlateGeo, brassMat);
      thaliMesh.position.y = -0.5;
      thaliMesh.castShadow = true;
      group.add(thaliMesh);

      // Rim rim border
      const rimGeo = new THREE.TorusGeometry(2.45, 0.08, 12, 48);
      const rimMesh = new THREE.Mesh(rimGeo, brassMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = -0.42;
      group.add(rimMesh);

      // Sweets arranged on plate
      const thaliItems = [
        { color: 0x4a1f0a, r: 0.45, x: 0, z: 0, y: -0.1 }, // Central Gulab Jamun
        { color: 0xfffaed, r: 0.38, x: 1.2, z: 0, y: -0.15 }, // Rasgulla
        { color: 0xfffaed, r: 0.38, x: -1.2, z: 0, y: -0.15 }, // Rasgulla
        { color: 0xf59e0b, r: 0.38, x: 0, z: 1.2, y: -0.15 }, // Motichoor Laddoo
        { color: 0xf59e0b, r: 0.38, x: 0, z: -1.2, y: -0.15 }, // Motichoor Laddoo
        { color: 0xffeedd, r: 0.32, x: 0.85, z: 0.85, y: -0.2 }, // Sandesh
        { color: 0xffeedd, r: 0.32, x: -0.85, z: -0.85, y: -0.2 } // Sandesh
      ];

      thaliItems.forEach((it) => {
        const itemMesh = new THREE.Mesh(
          new THREE.SphereGeometry(it.r, 20, 20),
          new THREE.MeshPhysicalMaterial({
            color: it.color,
            roughness: 0.25,
            clearcoat: 0.6
          })
        );
        itemMesh.position.set(it.x, it.y, it.z);
        itemMesh.castShadow = true;
        group.add(itemMesh);
      });
      break;
    }
  }

  return group;
}
