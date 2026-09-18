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
      return p.They + " is bald, with the scalp fully visible.";
    }
    var length = (phrase(state.catalogs.hairLengths, state.hairLength) || "").replace(/\s+hair$/i, "");
    var styleItem = findItem(state.catalogs.hairStyles, state.hairStyle) || {};
    var style = styleItem.phrase || "";
    var bits = [length, style].filter(Boolean);
    var owner = p.their === "her" ? "Her" : p.their === "his" ? "His" : "Their";
    var joined = bits.length === 2 ? bits[0] + ", with " + bits[1] : bits[0] || "visible";
    var base = owner + " hair is " + joined;
    if (styleItem.sweep === false) return ensureSentence(base);
    if (variant === "forward" || state.angle === "back") {
      return ensureSentence(
        base +
          ", swept forward over the shoulders and gathered to the front of the body so the entire back, neck, and shoulders stay bare and clearly visible"
      );
    }
    return ensureSentence(
      base +
        ", swept behind the shoulders and falling smoothly down the back so the front of the chest and collarbone stay clear and visible"
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
    if (setting && weather) {
      return "The setting is " + setting + ", and the weather and time read as " + weather + ".";
    }
    if (setting) return "The setting is " + setting + ".";
    return "The weather and time read as " + weather + ".";
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
    if (state.kind === "prop") return "The object is the focus of the shot.";
    if (state.kind === "location") return "The location fills the frame.";
    if (state.kind === "scene") return "The scene plays out in a single continuous beat.";
    return "The subject holds the frame.";
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
        tones.push(
          tone(
            "scene",
            "A named person holds " +
              held +
              " in a specified hand, fingers wrapped around it, the object fully belonging to that person."
          )
        );
      }
      return packTones(tones);
    }
    if (state.kind === "prop") {
      var scale = phrase(state.catalogs.propScales, state.propScale);
      var heldBy = phrase(state.catalogs.heldBy, state.heldBy);
      var propRef = state.bindRef ? " **[INSERT PROP REF HERE]**" : "";
      var propBits = ["The subject is the prop" + propRef + "."];
      if (scale) propBits.push(ensureSentence(scale));
      var condition = phrase(state.catalogs.conditions, state.condition);
      if (condition) propBits.push(ensureSentence("Its condition is " + condition));
      tones.push(tone("prop", propBits.join(" ")));
      tones.push(tone("place", environmentLine(state)));
      if (heldBy) {
        var owner = trim(state.propOwner) || "the person in frame";
        tones.push(tone("prop", ensureSentence(owner + " has the object " + heldBy)));
      }
      tones.push(tone("prop", headcountLine(state)));
      return packTones(tones);
    }
    var locScale = phrase(state.catalogs.locationScales, state.locationScale);
    var locRef = state.bindRef ? " **[INSERT LOCATION REF HERE]**" : "";
    tones.push(
      tone("location", ensureSentence("This is the location" + locRef + (locScale ? ", shown as " + locScale : "")))
    );
    tones.push(tone("place", environmentLine(state)));
    var arch = trim(state.architecture);
    if (arch) tones.push(tone("location", ensureSentence("The architecture reads as " + arch)));
    if (state.emptyPlate) {
      tones.push(tone("location", "There are exactly zero people in this frame. Empty plate."));
    } else {
      tones.push(tone("location", headcountLine(state)));
    }
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

  function compositionClause(state) {
    var view = phrase(state.catalogs.angles, state.angle);
    var crop = phrase(state.catalogs.crops, state.crop);
    var camAngle = phrase(state.catalogs.cameraAngles, state.cameraAngle);
    var bits = ["The framing is a " + [crop, view, camAngle].filter(Boolean).join(", with ") + "."];
    bits.push(gazeAndBody(state));
    return bits.join(" ");
  }

  function cameraClause(state) {
    var body = phrase(state.catalogs.cameras, state.camera);
    var lens = phrase(state.catalogs.lenses, state.lens);
    var dof = phrase(state.catalogs.depthsOfField, state.dof);
    return "The shot is taken on a " + body + " with " + lens + ", using " + dof + ".";
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
    var extra = skinSurfaceLine(state);
    if (extra) return state.catalogs.realismBlock + " " + extra;
    return state.catalogs.realismBlock;
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
    if (state.headcount === "crowd" || (state.headcount !== "0" && Number(state.headcount) > 1)) {
      base = base.replace(/^Keep extra people, /, "Keep ");
    }
    if (state.headcount === "0" || state.emptyPlate) {
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

  function cameraMoveClause(state) {
    return "The camera movement is " + phrase(state.catalogs.cameraMoves, state.cameraMove) + ".";
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
        "\nEnd state: The subject holds the final beat of that action, still in frame, still holding any prop named above."
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
          (trim(row.endState) ||
            "Holds the new position, still holding any prop named above.")
      );
    });
    return lines.join("\n");
  }

  function audioClause(state) {
    var bits = [];
    var dialogue = wrapAudio("dialogue", state.dialogue);
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
    var name = trim(state.name) || "the subject";
    var bits = [
      "Maintain Consistency: Keep " +
        name +
        "'s facial structure, hair, and body proportions locked",
    ];
    if (state.bindRef) bits.push("to **[INSERT CHARACTER REF HERE]**");
    bits.push(
      "throughout all stages. Wardrobe and environment stay identical. Include natural full-body shifts: shoulders squaring, weight transferring between feet, chest rising with breath."
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
        tone("surface", optionalSentence("Materials read as ", state.catalogs.materials, state.surfaceMaterial)),
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
          tone("craft", lightingClause(state)),
          tone("craft", backgroundClause(state)),
          tone("craft", optionalSentence("The colour grade is ", state.catalogs.colorGrades, state.colorGrade)),
          tone("surface", optionalSentence("The color palette is ", state.catalogs.colorPalettes, state.colorPalette)),
          tone("surface", optionalSentence("Materials read as ", state.catalogs.materials, state.surfaceMaterial)),
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
    if (state.medium === "video") shot.push(cameraMoveClause(state));
    shot.push(lightingClause(state));
    shot.push(backgroundClause(state));
    shot.push(optionalSentence("The colour grade is ", state.catalogs.colorGrades, state.colorGrade));
    shot.push(optionalSentence("The color palette is ", state.catalogs.colorPalettes, state.colorPalette));
    shot.push(optionalSentence("Materials read as ", state.catalogs.materials, state.surfaceMaterial));
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
        "The object is named in Idea or Name.",
        "Name the object in Idea so the model knows what to render."
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
        "Skin surface is None. Optional sheen / dewy / matte."
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
