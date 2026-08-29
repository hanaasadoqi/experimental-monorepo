# @workspace/prettier-config

Owns the single repository formatting policy. The root package consumes it through the `prettier` field, so leaf workspaces do not duplicate or drift formatting options.

This package does not own lint rules, import boundaries, generated-file policy, or editor-specific preferences unrelated to formatting.
