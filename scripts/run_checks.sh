#!/usr/bin/env bash
set -u

# Commands to run (in order)
COMMANDS=(
  "npm run build"
  "npm run validate:m1"
  "npm run validate:m2"
  "npm run validate:m3"
  "npm run validate:m4a"
  "npm run validate:m4b"
  "npm run validate:m5.1"
)

# Pretty printing helpers
ok()   { printf "✅ PASS  %s\n" "$1"; }
bad()  { printf "❌ FAIL  %s\n" "$1"; }
info() { printf "\n==> %s\n" "$1"; }

overall_rc=0

for cmd in "${COMMANDS[@]}"; do
  info "$cmd"
  # Run command (keep full output visible in the terminal)
  if bash -lc "$cmd"; then
    ok "$cmd"
  else
    rc=$?
    bad "$cmd (exit=$rc)"
    overall_rc=1
    # If you want to stop at first failure, uncomment the next line:
    # exit "$overall_rc"
  fi
done

printf "\n========================\n"
if [[ "$overall_rc" -eq 0 ]]; then
  printf "OVERALL: ✅ PASS\n"
else
  printf "OVERALL: ❌ FAIL\n"
fi

exit "$overall_rc"
