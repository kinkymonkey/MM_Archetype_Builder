(function () {
  "use strict";

  var catalogs = null;
  var copyTarget = "primary";

  var defaults = {
    idea: "",
    medium: "image",
    kind: "character",
    format: "cinematic-still",
    size: "9-16",
    angle: "front",
    crop: "medium",
    cameraAngle: "eye-level",
    camera: "hasselblad",
    lens: "85mm",
    dof: "shallow",
    lighting: "softbox",
    colorTemp: "none",
    colorGrade: "none",
    skinSurface: "none",
    studioBackground: "none",
    style: "photoreal",
    colorPalette: "none",
    surfaceMaterial: "none",
    surfaceFinish: "none",
    settingType: "none",
    weatherTime: "none",
    headcount: "1",
    sex: "female",
    ageGroup: "young-adult",
    ethnicitySelect: "southeast-asian",
    skinTone: "light",
    physique: "lean",
    name: "",
    ethnicity: "",
    entityType: "person",
    faceNotes: "",
    hairLength: "long",
    hairStyle: "none",
    expression: "neutral",
    posePreset: "guard",
    makeupLook: "none",
    bindRef: false,
    propInHands: "",
    propScale: "hero",
    condition: "worn",
    heldBy: "nobody",
    propOwner: "",
    locationScale: "street",
    emptyPlate: false,
    architecture: "",
    inImageText: "",
    inImageTextPlace: "",
    exclusions: "",
    duration: "6",
    cameraMove: "static",
    dialogue: "",
    accent: "american",
    accentNote: "",
    sfx: "",
    music: "",
    subtitles: "",
    stage1start: "0",
    stage1end: "2",
    stage1initial: "",
    stage1text: "",
    stage1endState: "",
    stage2start: "2",
    stage2end: "4",
    stage2initial: "",
    stage2text: "",
    stage2endState: "",
    stage3start: "4",
    stage3end: "6",
    stage3initial: "",
    stage3text: "",
    stage3endState: "",
  };

  function el(id) {
    return document.getElementById(id);
  }

  function fillSelect(select, items, value) {
    select.innerHTML = "";
    var grouped = items.some(function (item) {
      return item.group;
    });
    if (grouped) {
      var groups = [];
      items.forEach(function (item) {
        var name = item.group || "Other";
        if (groups.indexOf(name) === -1) groups.push(name);
      });
      groups.forEach(function (name) {
        var optgroup = document.createElement("optgroup");
        optgroup.label = name;
        items.forEach(function (item) {
          if ((item.group || "Other") !== name) return;
          var option = document.createElement("option");
          option.value = item.id;
          option.textContent = item.label;
          optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
      });
    } else {
      items.forEach(function (item) {
        var option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.label;
        select.appendChild(option);
      });
    }
    if (value && items.some(function (item) { return item.id === value; })) {
      select.value = value;
    }
  }

  function val(id) {
    var node = el(id);
    if (!node) return "";
    if (node.type === "checkbox") return node.checked;
    return node.value;
  }

  function headcountOptions() {
    var kind = val("kind");
    if (kind === "scene" || kind === "location") return catalogs.headcounts;
    return catalogs.headcounts.filter(function (item) {
      return item.id !== "crowd";
    });
  }

  function formatOptions() {
    return val("medium") === "video" ? catalogs.formatsVideo : catalogs.formatsImage;
  }

  function defaultFormatForMedium(medium) {
    var kind = val("kind");
    if (kind === "prop") return medium === "video" ? "commercial" : "lookbook";
    return medium === "video" ? "cinematic-scene" : "cinematic-still";
  }

  function kindPreset(kind, medium) {
    var video = medium === "video";
    var map = {
      character: {
        format: video ? "cinematic-scene" : "cinematic-still",
        size: "9-16",
        crop: "medium",
        angle: "front",
        cameraAngle: "eye-level",
        camera: video ? "cinema-35" : "hasselblad",
        lens: "85mm",
        dof: "shallow",
        lighting: "softbox",
        studioBackground: "none",
        entityType: "person",
        headcount: "1",
        style: "photoreal",
        settingType: "none",
        weatherTime: "none",
        emptyPlate: false,
      },
      scene: {
        format: video ? "cinematic-scene" : "cinematic-still",
        size: "16-9",
        crop: "wide",
        angle: "three-quarter",
        cameraAngle: "eye-level",
        camera: video ? "cinema-35" : "hasselblad",
        lens: "35mm",
        dof: "shallow",
        lighting: "window",
        studioBackground: "none",
        entityType: "person",
        headcount: "1",
        style: "cinematic",
        emptyPlate: false,
      },
      prop: {
        format: video ? "commercial" : "lookbook",
        size: "1-1",
        crop: "close-up",
        angle: "front",
        cameraAngle: "eye-level",
        camera: video ? "cinema-35" : "phase-one",
        lens: "50mm",
        dof: "shallow",
        lighting: "softbox",
        studioBackground: "white",
        entityType: "object",
        headcount: "0",
        style: "photoreal",
        settingType: "studio",
        colorTemp: "5600k",
        heldBy: "nobody",
        propScale: "hero",
        condition: "worn",
        emptyPlate: false,
      },
      location: {
        format: video ? "cinematic-scene" : "cinematic-still",
        size: "16-9",
        crop: "extreme-wide",
        angle: "front",
        cameraAngle: "eye-level",
        camera: video ? "cinema-35" : "hasselblad",
        lens: "24mm",
        dof: "deep",
        lighting: "overcast",
        studioBackground: "none",
        entityType: "landscape",
        headcount: "0",
        style: "photoreal",
        locationScale: "landscape",
        emptyPlate: true,
      },
    };
    return map[kind] || map.character;
  }

  function setField(id, value) {
    var node = el(id);
    if (!node) return;
    if (node.type === "checkbox") {
      node.checked = !!value;
      return;
    }
    if (node.tagName === "SELECT") {
      var match = Array.prototype.some.call(node.options, function (opt) {
        return opt.value === value;
      });
      if (match) node.value = value;
      return;
    }
    node.value = value;
  }

  function applyKindPreset(kind) {
    syncFormatSelect();
    syncHeadcountSelect();
    var preset = kindPreset(kind, val("medium"));
    Object.keys(preset).forEach(function (id) {
      setField(id, preset[id]);
    });
    syncFormatSelect();
    syncHeadcountSelect();
    setField("format", preset.format);
    setField("headcount", preset.headcount);
    render();
  }

  function syncFormatSelect() {
    var current = val("format");
    var options = formatOptions();
    var keep = options.some(function (item) { return item.id === current; })
      ? current
      : defaultFormatForMedium(val("medium"));
    fillSelect(el("format"), options, keep);
  }

  function syncHeadcountSelect() {
    var current = val("headcount");
    var options = headcountOptions();
    var keep = options.some(function (item) { return item.id === current; }) ? current : "1";
    fillSelect(el("headcount"), options, keep);
  }

  function show(id, on) {
    var node = el(id);
    if (!node) return;
    node.hidden = !on;
  }

  function refreshVisibility() {
    var medium = val("medium");
    var kind = val("kind");
    var crop = val("crop");
    var entity = val("entityType");
    var entityItem = window.PromptStitch.findItem(catalogs.entityTypes, entity) || {};
    document.body.dataset.medium = medium;
    document.body.dataset.kind = kind;
    show("sceneFields", kind === "scene");
    show("propFields", kind === "prop");
    show("locationFields", kind === "location");
    var ethnicityItem = window.PromptStitch.findItem(catalogs.ethnicities, val("ethnicitySelect")) || {};
    show("livingFields", !!entityItem.living);
    show("hairRow", !!entityItem.hair);
    show("hairStyleRow", !!entityItem.hair && val("hairLength") !== "bald");
    show("poseRow", !!entityItem.living && (kind === "character" || kind === "scene"));
    show("expressionRow", !!entityItem.living && (kind === "character" || kind === "scene"));
    show("mixRow", !!entityItem.living);
    show("faceRow", !!entityItem.living && entity !== "mech");
    show("skinRow", !!entityItem.living && !ethnicityItem.fantasy);
    show("outfitFields", !!entityItem.living);
    show("skinSurfaceRow", !!entityItem.living);
    var splitOn = !!el("splitNodes").checked;
    show("splitPrompt", splitOn);
    show("copySplit", splitOn);
    show("onePrompt", !splitOn);
    show("copyOne", !splitOn);
    el("statusKind").textContent = val("kind").charAt(0).toUpperCase() + val("kind").slice(1);
    el("tabImage").classList.toggle("on", medium === "image");
    el("tabVideo").classList.toggle("on", medium === "video");
    var studioBg = kind === "character" || kind === "prop";
    show("studioBgSelectRow", studioBg);
    show("studioBgNoteRow", studioBg);
    show("videoFields", medium === "video");
    show("videoNote", medium === "video");
    show("imageTextFields", medium === "image");
    syncFormatSelect();
    syncHeadcountSelect();
    if (kind === "location" && el("emptyPlate").checked) {
      el("headcount").value = "0";
    }
  }

  function collectState() {
    return {
      catalogs: catalogs,
      idea: val("idea"),
      medium: val("medium"),
      kind: val("kind"),
      format: val("format"),
      size: val("size"),
      angle: val("angle"),
      crop: val("crop"),
      cameraAngle: val("cameraAngle"),
      camera: val("camera"),
      lens: val("lens"),
      dof: val("dof"),
      lighting: val("lighting"),
      colorTemp: val("colorTemp"),
      colorGrade: val("colorGrade"),
      skinSurface: val("skinSurface"),
      studioBackground: val("studioBackground"),
      backgroundNote: val("backgroundNote"),
      style: val("style"),
      colorPalette: val("colorPalette"),
      surfaceMaterial: val("surfaceMaterial"),
      surfaceFinish: val("surfaceFinish"),
      settingType: val("settingType"),
      weatherTime: val("weatherTime"),
      headcount: val("headcount"),
      entityType: val("entityType"),
      sex: val("sex"),
      ageGroup: val("ageGroup"),
      ethnicitySelect: val("ethnicitySelect"),
      skinTone: val("skinTone"),
      physique: val("physique"),
      name: val("name"),
      ethnicity: val("ethnicity"),
      faceNotes: val("faceNotes"),
      hairLength: val("hairLength"),
      hairStyle: val("hairStyle"),
      expression: val("expression"),
      posePreset: val("posePreset"),
      outfitTop: val("outfitTop"),
      outfitBottom: val("outfitBottom"),
      outfitFootwear: val("outfitFootwear"),
      outfitOuter: val("outfitOuter"),
      makeupLook: val("makeupLook"),
      outfitMakeup: val("outfitMakeup"),
      jewelryEars: val("jewelryEars"),
      jewelryWatch: val("jewelryWatch"),
      jewelryOther: val("jewelryOther"),
      bindRef: val("bindRef"),
      propInHands: val("propInHands"),
      propScale: val("propScale"),
      condition: val("condition"),
      heldBy: val("heldBy"),
      propOwner: val("propOwner"),
      locationScale: val("locationScale"),
      emptyPlate: val("emptyPlate"),
      architecture: val("architecture"),
      inImageText: val("inImageText"),
      inImageTextPlace: val("inImageTextPlace"),
      exclusions: val("exclusions"),
      duration: val("duration"),
      cameraMove: val("cameraMove"),
      dialogue: val("dialogue"),
      accent: val("accent"),
      accentNote: val("accentNote"),
      sfx: val("sfx"),
      music: val("music"),
      subtitles: val("subtitles"),
      stages: [
        {
          start: val("stage1start"),
          end: val("stage1end"),
          initial: val("stage1initial"),
          text: val("stage1text"),
          endState: val("stage1endState"),
        },
        {
          start: val("stage2start"),
          end: val("stage2end"),
          initial: val("stage2initial"),
          text: val("stage2text"),
          endState: val("stage2endState"),
        },
        {
          start: val("stage3start"),
          end: val("stage3end"),
          initial: val("stage3initial"),
          text: val("stage3text"),
          endState: val("stage3endState"),
        },
      ],
    };
  }

  function render() {
    refreshVisibility();
    var result = window.PromptStitch.stitch(collectState());
    el("promptPrimary").value = result.primary;
    paintPrompt("promptPrimaryView", result.colored);
    el("partCharacteristics").value = result.parts.characteristics || "";
    el("partMakeup").value = result.parts.makeup || "";
    el("partOutfit").value = result.parts.outfit || "";
    el("partShot").value = result.parts.shot || "";
    el("wordCount").textContent = result.wordCount + " words";
    el("wordCount").classList.toggle("over", result.overLimit);
    el("limitNote").hidden = !result.overLimit;
    show("hairPair", result.hairPair);
    show("copyForward", result.hairPair);
    el("promptForward").value = result.hairForward || "";
    paintPrompt("promptForwardView", result.coloredForward);
    if (!result.hairPair) copyTarget = "primary";
    el("copyPrimary").classList.toggle("active", copyTarget === "primary");
    el("copyForward").classList.toggle("active", copyTarget === "forward");
    renderFidelity(collectState());
  }

  function paintPrompt(viewId, items) {
    var view = el(viewId);
    if (!view) return;
    view.innerHTML = (items || [])
      .map(function (item) {
        return "<p class=\"t-" + item.tone + "\">" + escapeHtml(item.text) + "</p>";
      })
      .join("");
  }

  function renderFidelity(state) {
    var report = window.PromptStitch.scoreFidelity(state);
    var circ = 97.4;
    el("fidelityScore").textContent = report.score + "%";
    el("fidelityBadge").textContent = report.label;
    el("fidelityArc").setAttribute("stroke-dashoffset", String(circ * (1 - report.score / 100)));
    el("fidelityRing").style.color =
      report.score >= 90 ? "var(--primary)" : report.score >= 70 ? "var(--secondary)" : report.score >= 50 ? "var(--tertiary)" : "var(--error)";
    el("statusReady").textContent = report.score + " · " + report.label;
    el("fidelityList").innerHTML = report.checks
      .map(function (item) {
        var icon = item.ok ? "check_circle" : "info";
        var klass = item.ok ? "ok" : "tip";
        return (
          "<li><span class=\"mi " +
          klass +
          "\" aria-hidden=\"true\">" +
          icon +
          "</span><span>" +
          item.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") +
          "</span></li>"
        );
      })
      .join("");
  }

  function copyFrom(id, btnId) {
    copyTarget = id;
    var text = el(id).value;
    var btn = el(btnId);
    function done() {
      var previous = btn.textContent;
      btn.textContent = "Copied";
      render();
      setTimeout(function () {
        btn.textContent = previous;
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function copyPrompt(which) {
    if (which === "forward") copyFrom("promptForward", "copyForward");
    else copyFrom("promptPrimary", "copyPrimary");
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  var LOCAL_PRESET_KEY = "mm-archetype-presets-v1";
  var presetCache = [];

  function isLocalHost() {
    var host = location.hostname;
    return host === "127.0.0.1" || host === "localhost";
  }

  function useDatabasePresets() {
    return isLocalHost();
  }

  function presetStatusLabel() {
    return useDatabasePresets()
      ? "Database connected. " + presetCache.length + " saved."
      : "Saved in this browser only. " + presetCache.length + " here.";
  }
  var SKIP_SNAPSHOT = {
    promptPrimary: true,
    promptForward: true,
    partCharacteristics: true,
    partMakeup: true,
    partOutfit: true,
    partShot: true,
    presetName: true,
  };

  function setPresetStatus(text, isError) {
    var node = el("presetStatus");
    if (!node) return;
    node.textContent = text;
    node.classList.toggle("warn", !!isError);
  }

  function apiPresets(method, id, body) {
    var url = "/api/presets" + (id ? "?id=" + encodeURIComponent(id) : "");
    var opts = { method: method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    return fetch(url, opts).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || "Database request failed.");
        }
        return data;
      });
    });
  }

  function readLocalPresets() {
    try {
      var raw = localStorage.getItem(LOCAL_PRESET_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  }

  function migrateLocalIfNeeded() {
    if (!useDatabasePresets()) return Promise.resolve();
    var local = readLocalPresets();
    if (!local.length) return Promise.resolve();
    return local
      .reduce(function (chain, item) {
        return chain.then(function () {
          return apiPresets("POST", null, item);
        });
      }, Promise.resolve())
      .then(function () {
        localStorage.removeItem(LOCAL_PRESET_KEY);
        return apiPresets("GET").then(function (data) {
          presetCache = data.presets || [];
        });
      });
  }

  function refreshPresetsFromDb() {
    if (!useDatabasePresets()) {
      presetCache = readLocalPresets();
      setPresetStatus(presetStatusLabel());
      renderPresets();
      return Promise.resolve();
    }
    return apiPresets("GET")
      .then(function (data) {
        presetCache = data.presets || [];
        return migrateLocalIfNeeded().then(function () {
          setPresetStatus(presetStatusLabel());
          renderPresets();
        });
      })
      .catch(function (err) {
        presetCache = [];
        setPresetStatus("Database is not reachable. " + err.message, true);
        renderPresets();
      });
  }

  function loadPresets() {
    return presetCache;
  }

  function snapshotFields() {
    var fields = {};
    document.querySelectorAll("#builder input, #builder select, #builder textarea, #idea, #splitNodes").forEach(function (node) {
      if (!node.id || SKIP_SNAPSHOT[node.id]) return;
      fields[node.id] = node.type === "checkbox" ? node.checked : node.value;
    });
    return fields;
  }

  function applyFields(fields) {
    if (!fields) return;
    if (fields.medium) setField("medium", fields.medium);
    syncFormatSelect();
    if (fields.kind) setField("kind", fields.kind);
    syncHeadcountSelect();
    Object.keys(fields).forEach(function (id) {
      if (id === "medium" || id === "kind") return;
      setField(id, fields[id]);
    });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function defaultPresetName(state) {
    var idea = String(state.idea || "").trim();
    if (idea) return idea.split("\n")[0].slice(0, 48);
    var kind = (state.kind || "character").replace(/^[a-z]/, function (ch) {
      return ch.toUpperCase();
    });
    return kind + " · " + (state.medium === "video" ? "video" : "image");
  }

  function renderPresets() {
    var list = loadPresets();
    el("presetCount").textContent = String(list.length);
    el("presetEmpty").hidden = list.length > 0;
    el("presetList").innerHTML = list
      .map(function (item) {
        var meta = (item.kind || "") + " · " + (item.medium === "video" ? "video" : "image");
        return (
          "<li class=\"preset-item\" data-id=\"" +
          escapeHtml(item.id) +
          "\"><p>" +
          escapeHtml(item.name) +
          "<span>" +
          escapeHtml(meta) +
          "</span></p><div class=\"row-actions\"><button type=\"button\" class=\"ghost\" data-act=\"load\">Load</button><button type=\"button\" class=\"ghost\" data-act=\"copy\">Copy</button><button type=\"button\" class=\"ghost\" data-act=\"delete\">Delete</button></div></li>"
        );
      })
      .join("");
  }

  function savePreset() {
    var state = collectState();
    var name = String(val("presetName") || "").trim() || defaultPresetName(state);
    var item = {
      id: String(Date.now()),
      name: name,
      medium: state.medium,
      kind: state.kind,
      prompt: el("promptPrimary").value,
      fields: snapshotFields(),
    };
    var btn = el("savePreset");
    var previous = btn.textContent;
    btn.textContent = "Saving";
    btn.disabled = true;
    var finish = function (ok) {
      btn.disabled = false;
      btn.textContent = ok ? "Saved" : previous;
      setTimeout(function () {
        btn.textContent = previous;
      }, 1200);
    };
    if (!useDatabasePresets()) {
      presetCache.unshift(item);
      localStorage.setItem(LOCAL_PRESET_KEY, JSON.stringify(presetCache));
      el("presetName").value = "";
      setPresetStatus(presetStatusLabel());
      renderPresets();
      finish(true);
      return;
    }
    apiPresets("POST", null, item)
      .then(function () {
        presetCache.unshift(item);
        el("presetName").value = "";
        setPresetStatus(presetStatusLabel());
        renderPresets();
        finish(true);
      })
      .catch(function (err) {
        setPresetStatus("Could not save. " + err.message, true);
        finish(false);
      });
  }

  function loadPreset(id) {
    var item = loadPresets().filter(function (entry) {
      return entry.id === id;
    })[0];
    if (!item) return;
    applyFields(item.fields);
    render();
  }

  function copyPreset(id) {
    var item = loadPresets().filter(function (entry) {
      return entry.id === id;
    })[0];
    if (!item) return;
    var text = item.prompt || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function deletePreset(id) {
    var applyDelete = function () {
      presetCache = presetCache.filter(function (entry) {
        return entry.id !== id;
      });
      setPresetStatus(presetStatusLabel());
      renderPresets();
    };
    if (!useDatabasePresets()) {
      applyDelete();
      localStorage.setItem(LOCAL_PRESET_KEY, JSON.stringify(presetCache));
      return;
    }
    apiPresets("DELETE", id)
      .then(applyDelete)
      .catch(function (err) {
        setPresetStatus("Could not delete. " + err.message, true);
      });
  }

  function bind() {
    document.querySelectorAll("input, select, textarea").forEach(function (node) {
      node.addEventListener("input", render);
      node.addEventListener("change", render);
    });
    el("medium").addEventListener("change", function () {
      applyKindPreset(val("kind"));
    });
    el("kind").addEventListener("change", function () {
      applyKindPreset(val("kind"));
    });
    el("format").addEventListener("change", function () {
      if (val("format") === "character-sheet" && val("studioBackground") === "none") {
        el("studioBackground").value = "light-gray-gradient";
      }
    });
    el("emptyPlate").addEventListener("change", function () {
      if (el("emptyPlate").checked) el("headcount").value = "0";
    });
    el("copyPrimary").addEventListener("click", function () {
      copyPrompt("primary");
    });
    el("copyForward").addEventListener("click", function () {
      copyPrompt("forward");
    });
    el("copyCharacteristics").addEventListener("click", function () {
      copyFrom("partCharacteristics", "copyCharacteristics");
    });
    el("copyMakeup").addEventListener("click", function () {
      copyFrom("partMakeup", "copyMakeup");
    });
    el("copyOutfit").addEventListener("click", function () {
      copyFrom("partOutfit", "copyOutfit");
    });
    el("copyShot").addEventListener("click", function () {
      copyFrom("partShot", "copyShot");
    });
    el("tabImage").addEventListener("click", function () {
      el("medium").value = "image";
      el("medium").dispatchEvent(new Event("change"));
    });
    el("tabVideo").addEventListener("click", function () {
      el("medium").value = "video";
      el("medium").dispatchEvent(new Event("change"));
    });
    el("savePreset").addEventListener("click", savePreset);
    var donateBar = el("donateBar");
    if (donateBar) {
      donateBar.addEventListener("click", function (event) {
        var btn = event.target.closest("button.donate");
        if (!btn) return;
        var amount = btn.getAttribute("data-amount");
        var previous = btn.textContent;
        btn.disabled = true;
        btn.textContent = "…";
        fetch("/api/donate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) }),
        })
          .then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok || !data.checkout_url) throw new Error(data.error || "Checkout failed.");
              window.location.href = data.checkout_url;
            });
          })
          .catch(function (err) {
            btn.disabled = false;
            btn.textContent = previous;
            setPresetStatus("Donate failed. " + err.message, true);
          });
      });
    }
    el("presetList").addEventListener("click", function (event) {
      var btn = event.target.closest("button");
      if (!btn) return;
      var item = btn.closest(".preset-item");
      if (!item) return;
      var id = item.getAttribute("data-id");
      var act = btn.getAttribute("data-act");
      if (act === "load") loadPreset(id);
      if (act === "copy") copyPreset(id);
      if (act === "delete") deletePreset(id);
    });
  }

  function populate() {
    fillSelect(el("size"), catalogs.sizes, defaults.size);
    fillSelect(el("angle"), catalogs.angles, defaults.angle);
    fillSelect(el("crop"), catalogs.crops, defaults.crop);
    fillSelect(el("cameraAngle"), catalogs.cameraAngles, defaults.cameraAngle);
    fillSelect(el("camera"), catalogs.cameras, defaults.camera);
    fillSelect(el("lens"), catalogs.lenses, defaults.lens);
    fillSelect(el("dof"), catalogs.depthsOfField, defaults.dof);
    fillSelect(el("lighting"), catalogs.lighting, defaults.lighting);
    fillSelect(el("colorTemp"), catalogs.colorTemps, defaults.colorTemp);
    fillSelect(el("colorGrade"), catalogs.colorGrades, defaults.colorGrade);
    fillSelect(el("skinSurface"), catalogs.skinSurfaces, defaults.skinSurface);
    fillSelect(el("studioBackground"), catalogs.studioBackgrounds, defaults.studioBackground);
    fillSelect(el("style"), catalogs.styles, defaults.style);
    fillSelect(el("colorPalette"), catalogs.colorPalettes, defaults.colorPalette);
    fillSelect(el("surfaceMaterial"), catalogs.materials, defaults.surfaceMaterial);
    fillSelect(el("surfaceFinish"), catalogs.surfaceFinishes, defaults.surfaceFinish);
    fillSelect(el("settingType"), catalogs.settingTypes, defaults.settingType);
    fillSelect(el("weatherTime"), catalogs.weatherTimes, defaults.weatherTime);
    fillSelect(el("entityType"), catalogs.entityTypes, defaults.entityType);
    fillSelect(el("sex"), catalogs.sexes, defaults.sex);
    fillSelect(el("ageGroup"), catalogs.ageGroups, defaults.ageGroup);
    fillSelect(el("ethnicitySelect"), catalogs.ethnicities, defaults.ethnicitySelect);
    fillSelect(el("skinTone"), catalogs.skinTones, defaults.skinTone);
    fillSelect(el("physique"), catalogs.physiques, defaults.physique);
    fillSelect(el("hairLength"), catalogs.hairLengths, defaults.hairLength);
    fillSelect(el("hairStyle"), catalogs.hairStyles, defaults.hairStyle);
    fillSelect(el("expression"), catalogs.expressions, defaults.expression);
    fillSelect(el("posePreset"), catalogs.posePresets, defaults.posePreset);
    fillSelect(el("makeupLook"), catalogs.makeupLooks, defaults.makeupLook);
    fillSelect(el("propScale"), catalogs.propScales, defaults.propScale);
    fillSelect(el("condition"), catalogs.conditions, defaults.condition);
    fillSelect(el("heldBy"), catalogs.heldBy, defaults.heldBy);
    fillSelect(el("locationScale"), catalogs.locationScales, defaults.locationScale);
    fillSelect(el("duration"), catalogs.durations, defaults.duration);
    fillSelect(el("cameraMove"), catalogs.cameraMoves, defaults.cameraMove);
    fillSelect(el("accent"), catalogs.accents, defaults.accent);
    el("bindRef").checked = defaults.bindRef;
    el("exclusions").placeholder = catalogs.exclusionsImage;
    syncFormatSelect();
    syncHeadcountSelect();
  }

  function boot(data) {
    catalogs = data;
    populate();
    bind();
    render();
    if (!isLocalHost()) {
      var bar = el("donateBar");
      if (bar) bar.hidden = false;
      if (el("presetHint")) {
        el("presetHint").textContent = "Saves in this browser only. Other visitors do not see your list.";
      }
    }
    if (/[?&]donated=1/.test(location.search)) {
      setPresetStatus("Thank you. Midnight Majestic got the donation.");
    }
    refreshPresetsFromDb();
  }

  function fail(message) {
    el("bootError").hidden = false;
    el("bootError").textContent = message;
  }

  fetch("catalogs.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load catalogs.json");
      return response.json();
    })
    .then(boot)
    .catch(function () {
      fail(
        "This page needs to be served as a site, not opened as a file. In Terminal, go to this folder and run: node serve.js  — then open http://127.0.0.1:8765/"
      );
    });
})();
