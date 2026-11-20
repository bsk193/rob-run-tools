(() => {
  const selector = "[data-tooltip]";
  const tooltip = document.createElement("div");
  tooltip.className = "app-tooltip";
  tooltip.id = "app-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.append(tooltip);

  let activeTarget = null;
  let pinned = false;

  function position() {
    if (!activeTarget || tooltip.hidden) return;
    const targetRect = activeTarget.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    const gutter = 12;
    let left = targetRect.left + (targetRect.width - tipRect.width) / 2;
    let top = targetRect.bottom + 8;
    if (top + tipRect.height > window.innerHeight - gutter) top = targetRect.top - tipRect.height - 8;
    left = Math.max(gutter, Math.min(left, window.innerWidth - tipRect.width - gutter));
    top = Math.max(gutter, Math.min(top, window.innerHeight - tipRect.height - gutter));
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function close() {
    if (activeTarget) {
      activeTarget.removeAttribute("aria-describedby");
      if (activeTarget instanceof HTMLButtonElement) activeTarget.removeAttribute("aria-expanded");
    }
    activeTarget = null;
    pinned = false;
    tooltip.hidden = true;
  }

  function show(target, pin = false) {
    const message = target?.dataset.tooltip?.trim();
    if (!message) return;
    if (activeTarget !== target) close();
    activeTarget = target;
    pinned = pin;
    tooltip.textContent = message.toLocaleUpperCase("en-US");
    tooltip.hidden = false;
    target.setAttribute("aria-describedby", tooltip.id);
    if (target instanceof HTMLButtonElement) target.setAttribute("aria-expanded", String(pinned));
    requestAnimationFrame(position);
  }

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    const target = event.target.closest?.(selector);
    if (target && !target.contains(event.relatedTarget)) show(target);
  });

  document.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    const target = event.target.closest?.(selector);
    if (target && !target.contains(event.relatedTarget) && activeTarget === target && !pinned && document.activeElement !== target) close();
  });

  document.addEventListener("focusin", (event) => {
    const target = event.target.closest?.(selector);
    if (target) show(target);
  });

  document.addEventListener("focusout", (event) => {
    const target = event.target.closest?.(selector);
    if (target && activeTarget === target && !pinned) close();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.(selector);
    if (!target) {
      if (pinned) close();
      return;
    }
    if (activeTarget === target && pinned) close();
    else show(target, true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("resize", position);
  window.addEventListener("scroll", position, true);
})();
