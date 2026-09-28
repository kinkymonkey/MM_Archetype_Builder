(function (root) {
  "use strict";

  function findItem(list, id) {
    if (!list) return null;
    return list.find(function (item) {
      return item.id === id;
    }) || null;
  }

  function phrase(list, id) {
    var item = findItem(list, id);
    return item && item.phrase ? item.phrase : "";
  }

  function trim(value) {
    return (value || "").toString().trim();
  }

  function joinClauses(parts) {
    return parts
      .filter(function (part) {
        return part && trim(part);
      })
      .join("\n\n");
  }

  function tone(name, text) {
    var body = trim(text);
    if (!body) return null;
    return { tone: name, text: body };
  }

  function packTones(items) {
    return items.filter(Boolean);
  }

  function joinTones(items) {
    return packTones(items)
      .map(function (item) {
        return item.text;
      })
      .join("\n\n");
  }

  function wordCount(text) {
    var words = trim(text).split(/\s+/).filter(Boolean);
    return words.length;
  }

  function wrapAudio(kind, text) {
    var body = trim(text);
    if (!body) return "";
    if (kind === "dialogue") {
      if (body.charAt(0) === "{") return body;
      return "{" + body + "}";
    }
    if (kind === "sfx") {
      if (body.charAt(0) === "<") return body;
      return "<" + body + ">";
    }
    if (kind === "music") {
      if (body.charAt(0) === "(") return body;
      return "(" + body + ")";
    }
    if (kind === "subtitles") {
      if (body.charAt(0) === "【") return body;
      return "【" + body + "】";
    }
    return body;
  }

  function ensureSentence(text) {
    var t = trim(text);
    if (!t) return "";
    t = t.replace(/\s+/g, " ");
    if (!/[.!?]$/.test(t)) t += ".";
    return t;
  }

  function quotedCopy(text) {
    var t = trim(text);
    if (!t) return "";
    var first = t.charAt(0);
    var last = t.charAt(t.length - 1);
    if ((first === '"' || first === "\u201c") && (last === '"' || last === "\u201d")) return t;
    t = t.replace(/^['"\u201c\u201d]+|['"\u201c\u201d]+$/g, "");
    return '"' + t + '"';
  }

  function pronoun(state) {
    var id = state.sex;
    if (id === "female" || id === "gynoid" || id === "fem-presenting") {
      return { they: "she", them: "her", their: "her", They: "She", have: "has" };
    }
    if (id === "male" || id === "masc-presenting") {
      return { they: "he", them: "him", their: "his", They: "He", have: "has" };
    }
    return { they: "they", them: "them", their: "their", They: "They", have: "have" };
  }

  function articleFor(text) {
    var w = trim(text).replace(/^(a|an)\s+/i, "");
    if (!w) return "a ";
    return /^[aeiou]/i.test(w) ? "an " : "a ";
  }

  function subjectName(state) {
    var name = trim(state.name);
    return name || "The subject";
  }

  function hairPosition(state, variant) {
    var p = pronoun(state);
    if (state.hairLength === "bald") {
      return p.They + (p.they === "they" ? " are" : " is") + " bald, with the scalp fully visible.";
    }
    var length = (phrase(state.catalogs.hairLengths, state.hairLength) || "").replace(/\s+hair$/i, "");
    var styleItem = findItem(state.catalogs.hairStyles, state.hairStyle) || {};
    var style = styleItem.phrase || "";
    var bits = [length, style].filter(Boolean);
    var owner = p.their === "her" ? "Her" : p.their === "his" ? "His" : "Their";
    var joined = bits.length === 2 ? bits[0] + ", with " + bits[1] : bits[0] || "visible";
    var base = owner + " hair is " + joined;
    // Fixed hair-position text is for character stills; scenes let the idea decide.
    if (styleItem.sweep === false || state.kind === "scene") return ensureSentence(base);
    if (variant === "forward" || state.angle === "back") {
      return ensureSentence(
        base +
          ", all of it swept forward over one shoulder, gathered to that side and falling down the front; the opposite shoulder and side of the neck fully clear and visible"
      );
    }
    return ensureSentence(
      base +
        ", all of it tucked behind the shoulders and ears; front of chest and collarbone fully clear and visible"
    );
  }

  function gazeAndBody(state) {
    var angle = state.angle;
    if (angle === "back") {
      return "The body faces away, squared to the camera, and the head faces directly away, matching the body's orientation.";
    }
    if (angle === "profile") {
      return "The body is in full profile, the head facing the same direction as the body, not twisted toward the camera, chin level and parallel to the ground.";
    }
    if (angle === "three-quarter") {
      return "This is a front-quarter view, body and head angled 45 degrees toward the camera, chin level and parallel to the ground, the face gazing straight ahead.";
    }
    return "The chin is level and parallel to the ground, the face pointed directly at the camera, the body facing forward and squared to the camera.";
  }

  function isCloseUp(crop) {
    return crop === "close-up" || crop === "extreme-close-up";
  }

  function environmentLine(state) {
    var setting = phrase(state.catalogs.settingTypes, state.settingType);
    var weather = phrase(state.catalogs.weatherTimes, state.weatherTime);
    if (!setting && !weather) return "";
    return [setting && "Setting: " + setting + ".", weather && "Weather and time: " + weather + "."]
      .filter(Boolean)
      .join(" ");
  }

  function optionalLabeled(label, list, id) {
    var text = phrase(list, id);
    if (!text) return "";
    return label + ": " + text + ".";
  }

  function optionalSentence(lead, list, id) {
    var text = phrase(list, id);
    if (!text) return "";
    return ensureSentence(lead + text.replace(/\.$/, ""));
  }

  function headcountLine(state) {
    var item = findItem(state.catalogs.headcounts, state.headcount);
    if (!item) return "";
    if (item.n === 0) {
      return "There are exactly zero people in this frame. Empty plate.";
    }
    if (item.n === "crowd") {
      return "A crowd is present in this frame.";
    }
    var n = Number(item.n);
    var name = trim(state.name);
    if (n === 1) {
      return name
        ? "There is exactly one person in this frame: " + name + "."
        : "There is exactly one person in this frame.";
    }
    return "There are exactly " + n + " people in this frame.";
  }

  function entityMeta(state) {
    return findItem(state.catalogs.entityTypes, state.entityType) || { living: false, hair: false, phrase: "subject" };
  }

  function featureLine(state) {
    var c = state.catalogs;
    var parts = [
      ["Face shape", phrase(c.faceShapes, state.faceShape)],
      [
        "Cheekbones",
        [phrase(c.cheekPositions, state.cheekPosition), phrase(c.cheekDefinitions, state.cheekDefinition)]
          .filter(Boolean)
          .join("; "),
      ],
      [
        "Jawline",
        [
          phrase(c.jawShapes, state.jawShape),
          phrase(c.jawDefinitions, state.jawDefinition),
          phrase(c.jawWidths, state.jawWidth),
        ]
          .filter(Boolean)
          .join("; "),
      ],
      ["Eye shape", phrase(c.eyeShapes, state.eyeShape)],
      ["Eye color", phrase(c.eyeColors, state.eyeColor)],
      [
        "Eyebrows",
        [
          phrase(c.browShapes, state.browShape),
          phrase(c.browDensities, state.browDensity),
          phrase(c.browTilts, state.browTilt),
        ]
          .filter(Boolean)
          .join(", "),
      ],
      [
        "Nose",
        [
          phrase(c.noseShapes, state.noseShape),
          phrase(c.noseProportions, state.noseProportion),
          phrase(c.noseTips, state.noseTip),
        ]
          .filter(Boolean)
          .join("; "),
      ],
      ["Mouth", phrase(c.mouths, state.mouth)],
      ["Lips", phrase(c.lips, state.lip)],
    ];
    return parts
      .filter(function (part) {
        return part[1];
      })
      .map(function (part) {
        return part[0] + ": " + part[1] + ".";
      })
      .join(" ");
  }

  function characterIdentity(state, hairVariant) {
    var meta = entityMeta(state);
    var bits = [];
    var name = subjectName(state);
    var ref = state.bindRef ? " **[INSERT CHARACTER REF HERE]**" : "";
    var entity = meta.phrase || "subject";
    if (!meta.living) {
      bits.push(ensureSentence(name + ref + " is " + entity));
      bits.push(headcountLine(state));
      return bits.filter(Boolean).join(" ");
    }
    var p = pronoun(state);
    var sex = phrase(state.catalogs.sexes, state.sex);
    var age = phrase(state.catalogs.ageGroups, state.ageGroup);
    var physique = phrase(state.catalogs.physiques, state.physique);
    var ethnicityItem = findItem(state.catalogs.ethnicities, state.ethnicitySelect);
    var who = name === "The subject" ? "The subject" : name;
    var role = entity;
    if (entity === "person") {
      if (state.sex === "female" || state.sex === "gynoid" || state.sex === "fem-presenting") role = "woman";
      else if (state.sex === "male" || state.sex === "masc-presenting") role = "man";
    }
    var descriptors =
      role === "woman" || role === "man" ? [age, role].filter(Boolean).join(" ") : [age, sex, entity].filter(Boolean).join(" ");
    var lead = who + ref + " is " + articleFor(descriptors) + descriptors;
    if (ethnicityItem && ethnicityItem.phrase) {
      lead += " of " + ethnicityItem.phrase + " heritage";
    }
    var mix = trim(state.ethnicity);
    if (mix) lead += ", with a mix note of " + mix;
    bits.push(ensureSentence(lead));
    if (!(ethnicityItem && ethnicityItem.fantasy)) {
      var skin = phrase(state.catalogs.skinTones, state.skinTone);
      if (skin) bits.push(ensureSentence(p.They + " " + p.have + " " + skin));
    }
    if (physique) {
      var body = physique.replace(/^(a|an)\s+/i, "");
      bits.push(ensureSentence(p.They + " " + p.have + " " + articleFor(body) + body));
    }
    var features = featureLine(state);
    if (features) bits.push(features);
    var face = trim(state.faceNotes);
    if (face) bits.push(ensureSentence("Facial features include " + face.replace(/\.$/, "")));
    if (meta.hair) bits.push(hairPosition(state, hairVariant));
    var expression = phrase(state.catalogs.expressions, state.expression);
    if (expression) {
      bits.push(
        ensureSentence(p.their.charAt(0).toUpperCase() + p.their.slice(1) + " face shows " + expression)
      );
    }
    bits.push(headcountLine(state));
    return bits.filter(Boolean).join(" ");
  }

  function poseLine(state) {
    var meta = entityMeta(state);
    if (!meta.living) return "";
    var pose = phrase(state.catalogs.posePresets, state.posePreset);
    if (!pose) return "";
    var p = pronoun(state);
    if (state.posePreset === "sheet" && state.angle === "profile") {
      return p.They + " stands with arms resting naturally at the sides, on extreme tiptoes, bare feet, highest arch.";
    }
    return ensureSentence(p.They + " is " + pose.replace(/\.$/, ""));
  }

  function makeupLine(state) {
    if (!entityMeta(state).living) return "";
    var look = findItem(state.catalogs.makeupLooks, state.makeupLook);
    if (look && trim(look.phrase)) {
      var makeup = "Makeup follows the " + look.label + " look. " + trim(look.phrase);
      if (trim(state.outfitMakeup)) makeup += " " + ensureSentence(trim(state.outfitMakeup));
      return makeup;
    }
    if (trim(state.outfitMakeup)) return ensureSentence("Makeup includes " + trim(state.outfitMakeup));
    return "";
  }

  function wardrobeLines(state) {
    if (!entityMeta(state).living) return [];
    var lines = [];
    var p = pronoun(state);
    var clothes = [];
    if (trim(state.outfitTop)) clothes.push(trim(state.outfitTop));
    if (trim(state.outfitBottom)) clothes.push(trim(state.outfitBottom));
    if (trim(state.outfitFootwear)) clothes.push(trim(state.outfitFootwear));
    if (trim(state.outfitOuter)) clothes.push(trim(state.outfitOuter));
    if (clothes.length === 1) {
      lines.push(ensureSentence(p.They + " wears " + clothes[0]));
    } else if (clothes.length === 2) {
      lines.push(ensureSentence(p.They + " wears " + clothes[0] + " and " + clothes[1]));
    } else if (clothes.length > 2) {
      lines.push(
        ensureSentence(p.They + " wears " + clothes.slice(0, -1).join(", ") + ", and " + clothes[clothes.length - 1])
      );
    }
    var makeup = makeupLine(state);
    if (makeup) lines.push(makeup);
    var jewels = [];
    if (trim(state.jewelryEars)) jewels.push(trim(state.jewelryEars) + " on the ears");
    if (trim(state.jewelryWatch)) jewels.push(trim(state.jewelryWatch));
    if (trim(state.jewelryOther)) jewels.push(trim(state.jewelryOther));
    if (jewels.length) {
      lines.push(ensureSentence("Jewelry includes " + jewels.join(", ")));
    }
    return lines;
  }

  function outfitOnlyLines(state) {
    if (!entityMeta(state).living) return [];
    return wardrobeLines(state).filter(function (line) {
      return line.indexOf("Makeup") !== 0;
    });
  }

  function openingBeat(state) {
    var idea = trim(state.idea);
    if (idea) return ensureSentence(idea);
    if (state.kind === "prop") return "The product is the focus of the shot.";
    if (state.kind === "location") return "The location fills the frame.";
    if (state.kind === "scene") return "The scene plays out in a single continuous beat.";
    return "The subject holds the frame.";
  }

  function productLine(state) {
    var c = state.catalogs;
    var ref = state.bindRef ? " **[INSERT PROP REF HERE]**" : "";
    var type = phrase(c.productTypes, state.productType);
    var name = trim(state.name);
    var lead = "The subject is the product" + ref;
    if (name && type) lead += ", " + name + ", " + articleFor(type) + type;
    else if (name) lead += ", " + name;
    else if (type) lead += ", " + articleFor(type) + type;
    var bits = [ensureSentence(lead)];
    var finish = phrase(c.productFinishes, state.productFinish);
    if (finish) bits.push(ensureSentence("It is finished in " + finish));
    var condition = phrase(c.conditions, state.condition);
    if (condition) bits.push(ensureSentence("Condition: " + condition));
    var surface = phrase(c.surfaceRisers, state.surfaceRiser);
    if (surface) bits.push(ensureSentence("It rests on " + surface));
    var support = phrase(c.supportProps, state.supportProp);
    if (support) bits.push(ensureSentence("Surrounding props include " + support));
    var effect = phrase(c.stylingEffects, state.stylingEffect);
    if (effect) bits.push(ensureSentence("Styling detail: " + effect));
    var shadow = phrase(c.shadowStyles, state.shadowStyle);
    if (shadow) bits.push(ensureSentence("The light leaves " + shadow));
    var reflection = phrase(c.reflections, state.reflection);
    if (reflection) bits.push(ensureSentence("There is " + reflection));
    return bits.join(" ");
  }

  function locationLine(state) {
    var c = state.catalogs;
    var ref = state.bindRef ? " **[INSERT LOCATION REF HERE]**" : "";
    var name = trim(state.name);
    var type = phrase(c.locationTypes, state.locationType);
    var lead = "This is the location" + ref;
    if (name) lead += ", " + name;
    if (type) lead += ", " + type;
    var bits = [ensureSentence(lead)];
    var arch = trim(state.architecture);
    if (arch) bits.push(ensureSentence("The architecture reads as " + arch));
    var condition = phrase(c.locationConditions, state.locationCondition);
    if (condition) bits.push(ensureSentence("It is " + condition));
    var season = phrase(c.seasons, state.season);
    if (season) bits.push(ensureSentence("The season is " + season));
    var fg = phrase(c.foregrounds, state.foreground);
    if (fg) bits.push(ensureSentence("Foreground framing: " + fg));
    return bits.join(" ");
  }

  function productPeopleLine(state) {
    var held = phrase(state.catalogs.heldBy, state.heldBy);
    if (held) return ensureSentence("The product is " + held + ", only the hands in frame, no face");
    return "There are no people in this frame.";
  }

  function subjectTones(state, hairVariant) {
    var tones = [tone("idea", openingBeat(state))];
    if (state.kind === "character") {
      var idBits = [characterIdentity(state, hairVariant), poseLine(state)].filter(Boolean);
      tones.push(tone("identity", idBits.join(" ")));
      var wear = wardrobeLines(state);
      if (wear.length) tones.push(tone("outfit", wear.join(" ")));
      tones.push(tone("place", environmentLine(state)));
      return packTones(tones);
    }
    if (state.kind === "scene") {
      var meta = entityMeta(state);
      if (meta.living) {
        var sceneId = [characterIdentity(state, hairVariant), poseLine(state)].filter(Boolean);
        tones.push(tone("identity", sceneId.join(" ")));
        var sceneWear = wardrobeLines(state);
        if (sceneWear.length) tones.push(tone("outfit", sceneWear.join(" ")));
      }
      tones.push(tone("place", environmentLine(state)));
      if (!meta.living) tones.push(tone("scene", headcountLine(state)));
      var held = trim(state.propInHands);
      if (held) {
        var holder = trim(state.name) || "The subject";
        tones.push(tone("scene", ensureSentence(holder + " holds " + held + ", fingers wrapped around it")));
      }
      return packTones(tones);
    }
    if (state.kind === "prop") {
      tones.push(tone("prop", productLine(state)));
      tones.push(tone("place", environmentLine(state)));
      tones.push(tone("prop", productPeopleLine(state)));
      return packTones(tones);
    }
    tones.push(tone("location", locationLine(state)));
    tones.push(tone("place", environmentLine(state)));
    tones.push(tone("location", headcountLine(state)));
    return packTones(tones);
  }

  function formatClause(state) {
    var list = state.medium === "video" ? state.catalogs.formatsVideo : state.catalogs.formatsImage;
    var fmt = phrase(list, state.format) || (state.medium === "video" ? "cinematic film scene" : "cinematic film still");
    var size = phrase(state.catalogs.sizes, state.size);
    var durationItem = findItem(state.catalogs.durations, state.duration);
    var article = /^[aeiou]/i.test(fmt) ? "an " : "a ";
    if (state.medium === "video" && durationItem) {
      return "This is " + article + fmt.toLowerCase() + " in a " + size + ", lasting " + durationItem.seconds + " seconds.";
    }
    return "This is " + article + fmt.toLowerCase() + " in a " + size + ".";
  }

  // Camera angle worded for products and places, which have no eye line.
  function objectAngle(state) {
    var item = findItem(state.catalogs.cameraAngles, state.cameraAngle);
    return item ? item.objectPhrase || item.phrase : "";
  }

  function compositionClause(state) {
    if (state.kind === "prop") {
      var parts = [
        phrase(state.catalogs.crops, state.crop),
        phrase(state.catalogs.productViews, state.productView),
        objectAngle(state),
      ].filter(Boolean);
      var line = parts.length ? "The framing is " + articleFor(parts[0]) + parts.join(", with ") + "." : "";
      var comp = phrase(state.catalogs.compositions, state.composition);
      if (comp) line += (line ? " " : "") + ensureSentence("The composition is " + comp);
      return line;
    }
    if (state.kind === "location") {
      var locParts = [phrase(state.catalogs.crops, state.crop), objectAngle(state)].filter(Boolean);
      var locLine = locParts.length ? "The framing is " + articleFor(locParts[0]) + locParts.join(", with ") + "." : "";
      var geometry = phrase(state.catalogs.geometries, state.geometry);
      if (geometry) locLine += (locLine ? " " : "") + ensureSentence("Geometry: " + geometry);
      return locLine;
    }
    var view = phrase(state.catalogs.angles, state.angle);
    var crop = phrase(state.catalogs.crops, state.crop);
    var camAngle = phrase(state.catalogs.cameraAngles, state.cameraAngle);
    var parts = [crop, view, camAngle].filter(Boolean);
    var bits = parts.length ? ["The framing is " + articleFor(parts[0]) + parts.join(", with ") + "."] : [];
    if (state.kind === "character") bits.push(gazeAndBody(state));
    return bits.join(" ");
  }

  function cameraClause(state) {
    var body = phrase(state.catalogs.cameras, state.camera);
    var lens = phrase(state.catalogs.lenses, state.lens);
    var dof = phrase(state.catalogs.depthsOfField, state.dof);
    var aperture =
      state.kind === "prop" || state.kind === "location" ? phrase(state.catalogs.apertures, state.aperture) : "";
    return "The shot is taken on a " + body + " with " + lens + ", using " + dof + (aperture ? ", " + aperture : "") + ".";
  }

  function lightingClause(state) {
    var light = "The scene is lit with " + phrase(state.catalogs.lighting, state.lighting);
    var kelvin = phrase(state.catalogs.colorTemps, state.colorTemp);
    if (kelvin) light += ". The colour temperature is " + kelvin;
    return ensureSentence(light);
  }

  function skinSurfaceLine(state) {
    if (!entityMeta(state).living) return "";
    return phrase(state.catalogs.skinSurfaces, state.skinSurface);
  }

  function realismClause(state) {
    if (state.kind === "prop") return state.catalogs.productRealismBlock;
    if (state.kind === "location") return state.catalogs.locationRealismBlock;
    if (!entityMeta(state).human) return state.catalogs.subjectRealismBlock;
    var extra = skinSurfaceLine(state);
    if (extra) return state.catalogs.realismBlock + " " + extra;
    return state.catalogs.realismBlock;
  }

  function materialsClause(state) {
    var main = phrase(state.catalogs.materials, state.surfaceMaterial);
    var accent = state.kind === "location" ? phrase(state.catalogs.materials, state.accentMaterial) : "";
    var list = [main, accent].filter(Boolean);
    if (!list.length) return "";
    return ensureSentence("Materials read as " + list.join(" with "));
  }

  function backgroundClause(state) {
    if (state.kind !== "character" && state.kind !== "prop") return "";
    var look = phrase(state.catalogs.studioBackgrounds, state.studioBackground);
    var extra = trim(state.backgroundNote);
    if (!look && !extra) return "";
    if (look && extra) return "The background is " + look + " " + ensureSentence(extra);
    if (look) return ensureSentence("The background is " + look);
    return ensureSentence("The background includes " + extra);
  }

  function styleClause(state) {
    var style = phrase(state.catalogs.styles, state.style);
    return ensureSentence("The visual style is " + style);
  }

  function textClause(state) {
    var text = trim(state.inImageText);
    if (!text) return "";
    var place = trim(state.inImageTextPlace) || "the center of the frame";
    return "Written text appears on " + place + " and reads " + quotedCopy(text) + ".";
  }

  function exclusionsClause(state) {
    var extra = trim(state.exclusions);
    var base = state.medium === "video" ? state.catalogs.exclusionsVideo : state.catalogs.exclusionsImage;
    if (state.kind === "prop") {
      base = state.medium === "video" ? state.catalogs.exclusionsProductVideo : state.catalogs.exclusionsProductImage;
      if (extra) return ensureSentence("Leave these things out of the shot. " + extra.replace(/\.$/, ""));
      if (findItem(state.catalogs.heldBy, state.heldBy) && state.heldBy !== "nobody") {
        base = base.replace(/^Keep people, stray hands, /, "Keep faces, extra hands, ");
      }
      return ensureSentence(base.replace(/\.$/, ""));
    }
    if (state.kind === "location") {
      if (extra) return ensureSentence("Leave these things out of the shot. " + extra.replace(/\.$/, ""));
      base = state.medium === "video" ? state.catalogs.exclusionsLocationVideo : state.catalogs.exclusionsLocationImage;
      if (state.headcount === "0") base = "The plate is empty, with no people. " + base;
      return ensureSentence(base.replace(/\.$/, ""));
    }
    if (state.headcount === "crowd" || (state.headcount !== "0" && Number(state.headcount) > 1)) {
      base = base.replace(/^Keep extra people, /, "Keep ");
    }
    if (state.headcount === "0") {
      base = "The plate is empty. " + base;
    }
    if (extra) return ensureSentence("Leave these things out of the shot. " + extra.replace(/\.$/, ""));
    return ensureSentence(base.replace(/\.$/, ""));
  }

  function refBindingLine(state) {
    if (!state.bindRef) return "";
    if (state.kind === "character") {
      var name = trim(state.name) || "the character";
    return "Keep this person locked to the same reference throughout. " + name + " **[INSERT CHARACTER REF HERE]**.";
    }
    if (state.kind === "prop") return "Reference: the prop **[INSERT PROP REF HERE]**.";
    if (state.kind === "location") return "Reference: the location **[INSERT LOCATION REF HERE]**.";
    return "Reference: **[INSERT SCENE REF HERE]**.";
  }

  function productMotionClause(state) {
    if (state.kind !== "prop" && state.kind !== "location") return "";
    var bits = [];
    var motion = phrase(state.catalogs.envMotions, state.envMotion);
    if (motion) bits.push(ensureSentence("Environmental motion: " + motion));
    var rate = phrase(state.catalogs.frameRates, state.frameRate);
    if (rate) bits.push(ensureSentence("Frame rate and pacing: " + rate));
    return bits.join(" ");
  }

  function cameraMoveClause(state) {
    var move = phrase(state.catalogs.cameraMoves, state.cameraMove);
    return move ? ensureSentence("Camera movement: " + move) : "";
  }

  function stageEndDefault(state) {
    if (state.kind === "prop") return "The product holds its final position, shape and label unchanged.";
    if (state.kind === "location") return "The location holds the final frame, architecture and layout unchanged.";
    return "The subject holds the final beat of that action, still in frame, still holding any prop named above.";
  }

  function stagesClause(state) {
    var durationItem = findItem(state.catalogs.durations, state.duration);
    var total = durationItem ? durationItem.seconds : 6;
    var filled = (state.stages || []).filter(function (row) {
      return trim(row.text);
    });
    var idea = trim(state.idea) || "The action described above plays out.";
    if (!filled.length) {
      return (
        "Stages & Action:\n[" +
        0 +
        "–" +
        total +
        " seconds]\nInitial state: The shot opens on the subject as described.\nPrimary event: " +
        idea +
        "\nEnd state: " +
        stageEndDefault(state)
      );
    }
    var lines = ["Stages & Action:"];
    filled.forEach(function (row, index) {
      var start = trim(row.start) || String(index === 0 ? 0 : "");
      var end = trim(row.end) || "";
      var label = start && end ? start + "–" + end + " seconds" : "Stage " + (index + 1);
      lines.push("[" + label + "]");
      lines.push("Initial state: " + (trim(row.initial) || "Continues from the previous beat."));
      lines.push("Primary event: " + trim(row.text));
      lines.push(
        "End state: " +
          (trim(row.endState) || stageEndDefault(state))
      );
    });
    return lines.join("\n");
  }

  function audioClause(state) {
    var bits = [];
    var dialogue = state.kind === "prop" || state.kind === "location" ? "" : wrapAudio("dialogue", state.dialogue);
    if (dialogue) {
      var accentItem = findItem(state.catalogs.accents, state.accent);
      var accentPhrase = accentItem ? accentItem.phrase : "fluent English with a standard American accent";
      if (state.accent === "other" && trim(state.accentNote)) {
        accentPhrase = "fluent English with a " + trim(state.accentNote) + " accent";
      }
      var speaker = trim(state.name) || "The speaker";
      bits.push(
        speaker +
          " speaks in " +
          accentPhrase +
          ", normal-to-brisk pace: " +
          dialogue
      );
    }
    var sfx = wrapAudio("sfx", state.sfx);
    if (sfx) bits.push("Sound effects: " + sfx);
    var music = wrapAudio("music", state.music);
    if (music) bits.push("Music: " + music);
    var subs = wrapAudio("subtitles", state.subtitles);
    if (subs) bits.push("On-screen text: " + subs);
    return bits.join(" ");
  }

  function maintainClause(state) {
    if (state.kind === "prop") {
      var product = trim(state.name) || "the product";
      return (
        "Maintain Consistency: Keep " +
        product +
        "'s shape, label, colour and finish locked" +
        (state.bindRef ? " to **[INSERT PROP REF HERE]**" : "") +
        " throughout all stages. Surface and props stay identical."
      );
    }
    if (state.kind === "location") {
      return (
        "Maintain Consistency: Keep " +
        (trim(state.name) || "the location") +
        "'s architecture, layout, materials and light direction locked" +
        (state.bindRef ? " to **[INSERT LOCATION REF HERE]**" : "") +
        " throughout all stages."
      );
    }
    var name = trim(state.name) || "the subject";
    var bits = [
      "Maintain Consistency: Keep " +
        name +
        "'s facial structure, hair, and body proportions locked",
    ];
    if (state.bindRef) bits.push("to **[INSERT CHARACTER REF HERE]**");
    bits.push(
      "throughout all stages. Wardrobe and environment stay identical. Include natural full-body shifts: shoulders squaring, weight transferring between feet, chest rising with breath"
    );
    return bits.join(" ") + ".";
  }

  function imageTones(state, hairVariant) {
    return packTones(
      subjectTones(state, hairVariant).concat([
        tone("identity", realismClause(state)),
        tone("craft", formatClause(state)),
        tone("craft", compositionClause(state)),
        tone("craft", cameraClause(state)),
        tone("craft", lightingClause(state)),
        tone("craft", backgroundClause(state)),
        tone("craft", optionalSentence("The colour grade is ", state.catalogs.colorGrades, state.colorGrade)),
        tone("surface", optionalSentence("The color palette is ", state.catalogs.colorPalettes, state.colorPalette)),
        tone("surface", materialsClause(state)),
        tone("surface", optionalSentence("The surface finish is ", state.catalogs.surfaceFinishes, state.surfaceFinish)),
        tone("text", textClause(state)),
        tone("craft", styleClause(state)),
        tone("text", exclusionsClause(state)),
      ])
    );
  }

  function videoTones(state, hairVariant) {
    var kindTone = state.kind === "prop" ? "prop" : state.kind === "location" ? "location" : "identity";
    return packTones(
      [tone(kindTone, refBindingLine(state))]
        .concat(subjectTones(state, hairVariant))
        .concat([
          tone("identity", realismClause(state)),
          tone("craft", formatClause(state)),
          tone("craft", compositionClause(state)),
          tone("craft", cameraClause(state)),
          tone("video", cameraMoveClause(state)),
          tone("video", productMotionClause(state)),
          tone("craft", lightingClause(state)),
          tone("craft", backgroundClause(state)),
          tone("craft", optionalSentence("The colour grade is ", state.catalogs.colorGrades, state.colorGrade)),
          tone("surface", optionalSentence("The color palette is ", state.catalogs.colorPalettes, state.colorPalette)),
          tone("surface", materialsClause(state)),
          tone("surface", optionalSentence("The surface finish is ", state.catalogs.surfaceFinishes, state.surfaceFinish)),
          tone("video", stagesClause(state)),
          tone("video", audioClause(state)),
          tone("craft", styleClause(state)),
          tone("identity", maintainClause(state)),
          tone("text", exclusionsClause(state)),
        ])
    );
  }

  function stitchImage(state, hairVariant) {
    return joinTones(imageTones(state, hairVariant));
  }

  function stitchVideo(state, hairVariant) {
    return joinTones(videoTones(state, hairVariant));
  }

  function splitParts(state, hairVariant) {
    var identity = [];
    if (state.kind === "character" || (state.kind === "scene" && entityMeta(state).living)) {
      identity.push(characterIdentity(state, hairVariant));
      var pose = poseLine(state);
      if (pose) identity.push(pose);
    }
    if (state.kind === "prop") {
      identity.push(productLine(state));
      identity.push(productPeopleLine(state));
    }
    identity.push(realismClause(state));
    identity.push(compositionClause(state));
    var characteristics = joinClauses(identity);
    var makeup = makeupLine(state);
    var outfit = joinClauses(outfitOnlyLines(state));
    var shot = [
      openingBeat(state),
      formatClause(state),
      environmentLine(state),
      cameraClause(state),
    ];
    if (state.medium === "video") {
      shot.push(cameraMoveClause(state));
      shot.push(productMotionClause(state));
    }
    shot.push(lightingClause(state));
    shot.push(backgroundClause(state));
    shot.push(optionalSentence("The colour grade is ", state.catalogs.colorGrades, state.colorGrade));
    shot.push(optionalSentence("The color palette is ", state.catalogs.colorPalettes, state.colorPalette));
    shot.push(materialsClause(state));
    shot.push(optionalSentence("The surface finish is ", state.catalogs.surfaceFinishes, state.surfaceFinish));
    if (state.medium === "video") {
      shot.push(stagesClause(state));
      shot.push(audioClause(state));
      shot.push(maintainClause(state));
    }
    shot.push(styleClause(state));
    shot.push(exclusionsClause(state));
    return {
      characteristics: characteristics,
      makeup: makeup,
      outfit: outfit,
      shot: joinClauses(shot),
    };
  }

  function stitch(state) {
    var hairPair =
      state.medium === "image" &&
      state.kind === "character" &&
      isCloseUp(state.crop) &&
      state.angle !== "back" &&
      state.hairLength !== "bald" &&
      !!(findItem(state.catalogs.entityTypes, state.entityType) || {}).hair;

    var colored =
      state.medium === "video" ? videoTones(state, "behind") : imageTones(state, "behind");
    var primary = joinTones(colored);

    var result = {
      primary: primary,
      colored: colored,
      coloredForward: [],
      hairForward: "",
      wordCount: wordCount(primary),
      overLimit: state.medium === "image" && wordCount(primary) >= 600,
      hairPair: hairPair,
      parts: splitParts(state, "behind"),
    };

    if (hairPair) {
      result.coloredForward = imageTones(state, "forward");
      result.hairForward = joinTones(result.coloredForward);
    }
    return result;
  }

  function filled(value) {
    return String(value || "").trim().length > 0;
  }

  function scoreFidelity(state) {
    var checks = [];
    function add(ok, pass, miss) {
      checks.push({ ok: !!ok, text: ok ? pass : miss });
    }

    add(
      filled(state.idea),
      "Idea beat is in the prompt.",
      "No idea yet. The guides want a beat, not only dropdowns."
    );
    add(
      filled(state.camera) && filled(state.lens),
      "Camera and lens are named.",
      "Camera or lens is missing from Craft."
    );
    add(
      filled(state.lighting),
      "Lighting is named.",
      "Lighting is empty."
    );

    if (state.kind === "character" || state.kind === "prop") {
      add(
        state.studioBackground && state.studioBackground !== "none",
        "Studio background is set.",
        "Background is still None. Check if you meant a seamless."
      );
    }

    if (state.kind === "scene" || state.kind === "location") {
      add(
        (state.settingType && state.settingType !== "none") ||
          (state.weatherTime && state.weatherTime !== "none") ||
          filled(state.idea),
        "Place can come from the idea, setting, or weather.",
        "Setting and weather are None. If the idea does not name a place, add one."
      );
    }

    if (state.kind === "character") {
      add(
        filled(state.outfitTop) ||
          filled(state.outfitBottom) ||
          filled(state.outfitFootwear) ||
          filled(state.outfitOuter),
        "At least one wardrobe slot is filled.",
        "Outfit slots are empty. Skip this if you do not want clothes in the prompt."
      );
      add(
        (state.makeupLook && state.makeupLook !== "none") || filled(state.outfitMakeup),
        "Makeup is specified.",
        "Makeup look is None. Skip this if you do not want makeup."
      );
      add(
        state.hairLength === "bald" || (state.hairStyle && state.hairStyle !== "none"),
        "Hairstyle is specified.",
        "Hairstyle is None. Length is in the prompt; pick a cut if you want one."
      );
      add(
        filled(state.faceNotes),
        "Face notes are filled.",
        "No face notes. Optional unless you need a specific face."
      );
    }

    if (state.kind === "prop") {
      add(
        filled(state.idea) || filled(state.name),
        "The product is named in Idea or Product name.",
        "Name the product in Idea or Product name so the model knows what to render."
      );
    }

    if (state.kind === "location") {
      add(
        filled(state.architecture) || filled(state.idea),
        "Location is named in Idea or the architecture note.",
        "No architecture note. Fine if the idea already names the place."
      );
    }

    add(
      state.colorTemp && state.colorTemp !== "none",
      "Colour temperature is set.",
      "Colour temperature is None. Optional Kelvin from the lighting guide."
    );
    add(
      state.colorGrade && state.colorGrade !== "none",
      "Colour grade is set.",
      "Colour grade is None. Optional."
    );

    var living = !!(findItem(state.catalogs.entityTypes, state.entityType) || {}).living;
    if (living) {
      add(
        state.skinSurface && state.skinSurface !== "none",
        "Skin surface is set.",
        "Skin surface is None. Optional bare matte."
      );
    }

    if (state.medium === "video") {
      var hasStage = (state.stages || []).some(function (stage) {
        return filled(stage.text) || filled(stage.initial);
      });
      add(
        hasStage || filled(state.idea),
        "The clip has a beat in Idea or the timeline.",
        "No timeline beat yet. Optional if the idea already covers the clip."
      );
    }

    var okCount = checks.filter(function (item) {
      return item.ok;
    }).length;
    var score = checks.length ? Math.round((okCount / checks.length) * 100) : 0;
    var label = score >= 90 ? "OPTIMAL" : score >= 70 ? "STRONG" : score >= 50 ? "PARTIAL" : "THIN";
    return { score: score, label: label, checks: checks };
  }

  root.PromptStitch = {
    stitch: stitch,
    wordCount: wordCount,
    findItem: findItem,
    phrase: phrase,
    scoreFidelity: scoreFidelity,
  };
})(typeof window !== "undefined" ? window : globalThis);
