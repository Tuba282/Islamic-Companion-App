---
name: Expo notification channels
description: Native notification sound and Android channel behavior in the Expo preview environment.
---

Expo Go can expose `expo-notifications` scheduling but may not provide the Android notification-channel provider. Channel creation should be guarded so preview does not crash; native builds should still configure a high-importance channel with sound and vibration.

**Why:** The preview environment rejected `setNotificationChannelAsync` even though the TypeScript API was valid, which otherwise produced unhandled runtime errors.

**How to apply:** Wrap Android channel setup in a try/catch, keep the channel ID on the notification trigger, and verify the final sound on a real phone/native build with notification permission and phone sound enabled.