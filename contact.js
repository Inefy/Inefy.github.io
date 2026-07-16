(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const EMAIL = form.dataset.contactEmail || "hello@zacbatten.me";
  const statusEl = form.querySelector("[data-form-status]");
  const copyButton = form.querySelector("[data-copy-summary]");

  function field(name) {
    const el = form.elements.namedItem(name);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function buildSubject() {
    return "Project enquiry";
  }

  function buildBody() {
    const lines = [];
    const name = field("name");
    const email = field("email");
    const message = field("message");

    if (name) lines.push(`Name: ${name}`);
    if (email) lines.push(`Email: ${email}`);
    if (lines.length) lines.push("");
    lines.push(message || "");
    return lines.join("\n");
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function focusFirstInvalid() {
    const message = form.elements.namedItem("message");
    if (message && !message.value.trim()) {
      message.focus();
      setStatus("Add a short note about your project, then try again.");
      return false;
    }
    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!focusFirstInvalid()) return;

    const mailto =
      `mailto:${EMAIL}` +
      `?subject=${encodeURIComponent(buildSubject())}` +
      `&body=${encodeURIComponent(buildBody())}`;

    setStatus("Opening your email app with the details filled in…");
    window.location.href = mailto;
  });

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      if (!focusFirstInvalid()) return;
      const text = `To: ${EMAIL}\nSubject: ${buildSubject()}\n\n${buildBody()}`;
      try {
        await navigator.clipboard.writeText(text);
        setStatus("Copied the message — paste it into any email app.");
      } catch {
        setStatus(`Copy is blocked here. Email ${EMAIL} directly.`);
      }
    });
  }
})();
