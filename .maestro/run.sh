#!/usr/bin/env bash
# Runs inside the Android emulator job. Installs the test APK, runs the Maestro flows, saves screenshots and app errors.
set -x
mkdir -p shots emu-logs
adb install -r amcolink-staging-test-*.apk > emu-logs/install.txt 2>&1
adb logcat -c
adb logcat -G 16M >/dev/null 2>&1 || true
# Record app messages and crashes for the whole run (the phone's own log is too small to keep them all).
adb logcat -v time ReactNativeJS:V ReactNative:V AndroidRuntime:E ActivityManager:I '*:S' > emu-logs/logcat-full.txt 2>&1 &
LOGCAT_PID=$!
# Let the emulator settle and close any system dialog before testing.
sleep 20
adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null 2>&1 || true
maestro test .maestro/flows > emu-logs/maestro.txt 2>&1; echo $? > emu-logs/maestro-exit.txt
find . ~/.maestro -name '*.png' -newer emu-logs/install.txt -not -path './shots/*' -exec cp {} shots/ \; 2>/dev/null
kill $LOGCAT_PID 2>/dev/null || true
adb logcat -d -b crash > emu-logs/crash.txt 2>&1
grep -E 'FATAL|AndroidRuntime|has died|ANR in|amcolink' emu-logs/logcat-full.txt > emu-logs/logcat.txt 2>/dev/null || true
exit 0
