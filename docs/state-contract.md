# State Contract

Teledex writes runtime state under `TELEDEX_STATE_ROOT`. Keep this directory
private and outside version control.

Typical state includes session metadata, delivery bookkeeping, cached runtime
status, and temporary files. The public repository ships code and examples, not
live state.
