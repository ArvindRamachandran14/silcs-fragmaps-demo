#!/usr/bin/env bash
set -u

# Commands to run (in order)
COMMANDS=(
  "npm run build"
  "node scripts/validate-m1.js"
  "node scripts/validate-m2.js"
  "node scripts/validate-m3.js"
  "node scripts/validate-m4a.js"
  "node scripts/validate-m4b.js"
  "node scripts/validate-m5-1.js"
  "node scripts/validate-m5-2.js"
  "node scripts/validate-m5-2a.js"
  "node scripts/validate-m5-2b.js"
  "node scripts/validate-m5-3.js"
  "node scripts/validate-m5-4.js"
  "node scripts/validate-m5-5.js"
  "node scripts/validate-m5-6.js"
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
    if [[ "$cmd" == "node scripts/validate-m1.js" ]]; then
      printf "⚠️ RETRY  %s (known intermittent flake)\n" "$cmd"
      if bash -lc "$cmd"; then
        ok "$cmd (retry)"
        continue
      else
        rc=$?
      fi
    fi
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
