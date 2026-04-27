(function () {
  const data = window.PVZ_DATA || { plants: [], zombies: [], levels: [], sources: [] };
  const state = {
    view: "plants",
    query: "",
    filter: "all"
  };

  const cards = document.querySelector("#cards");
  const filterSelect = document.querySelector("#filterSelect");
  const searchInput = document.querySelector("#searchInput");
  const visibleCount = document.querySelector("#visibleCount");
  const detailPanel = document.querySelector("#detailPanel");
  const detailContent = document.querySelector("#detailContent");
  const terms = [...data.plants, ...data.zombies]
    .filter((item) => item.en && item.cn)
    .sort((a, b) => b.en.length - a.en.length);

  document.querySelector("#plantCount").textContent = data.plants.length;
  document.querySelector("#zombieCount").textContent = data.zombies.length;
  document.querySelector("#levelCount").textContent = data.levels.length;
  document.querySelector("#generatedAt").textContent = data.generatedAt
    ? `数据生成：${new Date(data.generatedAt).toLocaleString("zh-CN")}`
    : "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function localizeTerms(value) {
    let output = String(value || "");
    terms.forEach((term) => {
      output = output.replace(new RegExp(`\\b${escapeRegExp(term.en)}\\b`, "g"), `${term.cn} (${term.en})`);
    });
    return output;
  }

  function currentItems() {
    return data[state.view] || [];
  }

  function optionLabel(value) {
    if (value === "all") return "全部分类";
    return value;
  }

  function buildFilters() {
    const values = new Set(["all"]);
    if (state.view === "plants") {
      data.plants.forEach((item) => {
        item.tags.forEach((tag) => values.add(tag));
        values.add(item.role);
      });
    } else if (state.view === "zombies") {
      data.zombies.forEach((item) => values.add(item.role));
    } else {
      data.levels.forEach((item) => {
        values.add(item.world);
        values.add(item.type);
      });
    }
    filterSelect.innerHTML = [...values]
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(optionLabel(value))}</option>`)
      .join("");
    filterSelect.value = state.filter;
    if (filterSelect.value !== state.filter) {
      state.filter = "all";
      filterSelect.value = "all";
    }
  }

  function searchableText(item) {
    return normalize([
      item.cn,
      item.en,
      item.role,
      item.world,
      item.type,
      item.summary,
      item.overview,
      item.reward,
      item.plants,
      item.zombies,
      ...(item.tags || []),
      ...(item.tips || []),
      ...(item.counters || []),
      ...(item.stats || []).flatMap((stat) => [stat.label, stat.value])
    ].filter(Boolean).join(" "));
  }

  function matchesFilter(item) {
    if (state.filter === "all") return true;
    if (state.view === "plants") {
      return item.role === state.filter || item.tags.includes(state.filter);
    }
    if (state.view === "zombies") {
      return item.role === state.filter;
    }
    return item.world === state.filter || item.type === state.filter;
  }

  function filteredItems() {
    const query = normalize(state.query);
    return currentItems().filter((item) => {
      const queryOk = !query || searchableText(item).includes(query);
      return queryOk && matchesFilter(item);
    });
  }

  function imageBlock(item) {
    const label = escapeHtml(item.cn || item.title || item.en);
    if (!item.icon) return `<div class="thumb is-empty" aria-label="${label}"></div>`;
    return `<div class="thumb"><img src="${escapeHtml(item.icon)}" alt="${label}" loading="lazy"></div>`;
  }

  function chip(value, tone = "") {
    if (!value) return "";
    return `<span class="chip ${tone}">${escapeHtml(value)}</span>`;
  }

  function trimText(value, size = 92) {
    const text = String(value || "");
    return text.length > size ? `${text.slice(0, size)}...` : text;
  }

  function plantCard(item, index) {
    return `
      <button class="card" type="button" data-index="${index}">
        ${imageBlock(item)}
        <div class="card-body">
          <div class="card-title">
            <h2>${escapeHtml(item.cn)}<br>${escapeHtml(item.en)}</h2>
            <span>${escapeHtml(item.role)}</span>
          </div>
          <p class="summary">${escapeHtml(trimText(item.summary))}</p>
          <div class="chips">
            ${chip(`阳光 ${item.quick.sun}`)}
            ${chip(`冷却 ${item.quick.recharge}`)}
            ${chip(`伤害 ${item.quick.damage}`, "danger")}
          </div>
        </div>
      </button>
    `;
  }

  function zombieCard(item, index) {
    return `
      <button class="card" type="button" data-index="${index}">
        ${imageBlock(item)}
        <div class="card-body">
          <div class="card-title">
            <h2>${escapeHtml(item.cn)}<br>${escapeHtml(item.en)}</h2>
            <span>${escapeHtml(item.role)}</span>
          </div>
          <p class="summary">${escapeHtml(trimText(item.summary))}</p>
          <div class="chips">
            ${chip(`生命 ${item.quick.health}`, "danger")}
            ${chip(`韧性 ${item.quick.toughness}`)}
            ${chip(item.quick.firstSeen)}
          </div>
        </div>
      </button>
    `;
  }

  function levelCard(item, index) {
    return `
      <button class="card" type="button" data-index="${index}">
        ${imageBlock(item)}
        <div class="card-body">
          <div class="card-title">
            <h2>${escapeHtml(item.cn)}<br>${escapeHtml(item.title)}</h2>
            <span>${escapeHtml(item.world)}</span>
          </div>
          <p class="summary">${escapeHtml(trimText(item.overview, 100))}</p>
          <div class="chips">
            ${chip(item.type)}
            ${chip(`旗帜 ${item.flags}`)}
            ${chip(item.reward, "water")}
          </div>
        </div>
      </button>
    `;
  }

  function renderCards() {
    buildFilters();
    const items = filteredItems();
    visibleCount.textContent = items.length;
    if (!items.length) {
      cards.innerHTML = `<div class="empty">没有匹配结果</div>`;
      return;
    }
    const renderer = state.view === "plants" ? plantCard : state.view === "zombies" ? zombieCard : levelCard;
    cards.innerHTML = items.map((item, index) => renderer(item, index)).join("");
    cards.querySelectorAll(".card").forEach((card, index) => {
      card.addEventListener("click", () => openDetail(items[index]));
    });
    cards.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(".thumb");
        parent.classList.add("is-empty");
        img.remove();
      });
    });
  }

  function statsGrid(stats) {
    if (!stats.length) return "";
    return `
      <section class="detail-section">
        <h3>属性数据</h3>
        <div class="stat-grid">
          ${stats.map((stat) => `
            <div class="stat">
              <span>${escapeHtml(stat.label)}</span>
              <strong>${escapeHtml(stat.value)}</strong>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function guideList(title, items) {
    if (!items || !items.length) return "";
    return `
      <section class="detail-section">
        <h3>${escapeHtml(title)}</h3>
        <ul class="guide-list">
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function detailHero(item, subtitle, summary) {
    return `
      <div class="detail-hero">
        ${imageBlock(item)}
        <div>
          <p class="detail-kicker">${escapeHtml(subtitle)}</p>
          <h2 id="detailTitle">${escapeHtml(item.cn || item.title)}${item.en ? ` / ${escapeHtml(item.en)}` : ""}</h2>
          <p>${escapeHtml(summary)}</p>
          <div class="chips">
            ${(item.tags || []).map((tag) => chip(tag)).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function sourceSection(item) {
    return `
      <section class="detail-section">
        <h3>来源</h3>
        <a class="source-link" href="${escapeHtml(item.wiki)}" target="_blank" rel="noreferrer">${escapeHtml(item.wiki)}</a>
      </section>
    `;
  }

  function levelStats(item) {
    return [
      { label: "场景", value: item.world },
      { label: "地形", value: item.terrain },
      { label: "类型", value: item.type },
      { label: "旗帜", value: item.flags },
      { label: "奖励", value: item.reward },
      { label: "可用植物", value: localizeTerms(item.plants) },
      { label: "出现僵尸", value: localizeTerms(item.zombies) }
    ];
  }

  function openDetail(item) {
    const isLevel = state.view === "levels";
    const subtitle = isLevel ? `${item.world} · ${item.type}` : item.role;
    const summary = isLevel ? item.overview : item.summary;
    const guideTitle = state.view === "zombies" ? "反制攻略" : "攻略要点";
    const guideItems = isLevel ? item.tips : state.view === "zombies" ? item.counters : item.tips;
    detailContent.innerHTML = [
      detailHero(item, subtitle, summary),
      statsGrid(isLevel ? levelStats(item) : item.stats),
      guideList(guideTitle, guideItems),
      sourceSection(item)
    ].join("");
    detailContent.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(".thumb");
        parent.classList.add("is-empty");
        img.remove();
      });
    });
    detailPanel.classList.add("is-open");
    detailPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDetail() {
    detailPanel.classList.remove("is-open");
    detailPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      state.filter = "all";
      document.querySelectorAll(".tab").forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      renderCards();
    });
  });

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderCards();
  });

  filterSelect.addEventListener("change", (event) => {
    state.filter = event.target.value;
    renderCards();
  });

  detailPanel.querySelectorAll("[data-close]").forEach((node) => {
    node.addEventListener("click", closeDetail);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });

  renderCards();
})();
