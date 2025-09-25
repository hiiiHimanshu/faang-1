// Placeholder Firebase messaging service worker.
// Replace with messaging handlers once you configure FCM.
self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (!data) return;

  const { title, body } = data.notification ?? {};
  event.waitUntil(
    self.registration.showNotification(title ?? "Atlas Ledger", {
      body,
    }),
  );
});
