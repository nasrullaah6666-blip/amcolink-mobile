#!/usr/bin/env bash
# Runs inside the Android emulator job. Installs the test APK, runs the Maestro flows, saves screenshots and app errors.
set -x
mkdir -p shots emu-logs
adb install -r amcolink-staging-test-*.apk > emu-logs/install.txt 2>&1
adb logcat -c
# Let the emulator settle and close any system dialog before testing.
sleep 20
adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null 2>&1 || true
maestro test .maestro/flows > emu-logs/maestro.txt 2>&1; echo $? > emu-logs/maestro-exit.txt
find . ~/.maestro -name '*.png' -newer emu-logs/install.txt -not -path './shots/*' -exec cp {} shots/ \; 2>/dev/null
adb logcat -d -s ReactNativeJS:V ReactNative:V AndroidRuntime:E > emu-logs/logcat.txt 2>&1
exit 0
