{{/*
Expand the name of the chart.
*/}}
{{- define "penpalmap-api-v2.name" -}}
    {{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "penpalmap-api-v2.fullname" -}}
    {{- if .Values.fullnameOverride }}
        {{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
    {{- else }}
        {{- $name := default .Chart.Name .Values.nameOverride }}
        {{- if contains $name .Release.Name }}
            {{- .Release.Name | trunc 63 | trimSuffix "-" }}
        {{- else }}
            {{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
        {{- end }}
    {{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "penpalmap-api-v2.chart" -}}
    {{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "penpalmap-api-v2.labels" -}}
helm.sh/chart: {{ include "penpalmap-api-v2.chart" . }}
{{ include "penpalmap-api-v2.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "penpalmap-api-v2.selectorLabels" -}}
app.kubernetes.io/name: {{ include "penpalmap-api-v2.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "penpalmap-api-v2.serviceAccountName" -}}
    {{- if .Values.serviceAccount.create }}
        {{- default (include "penpalmap-api-v2.fullname" .) .Values.serviceAccount.name }}
    {{- else }}
        {{- default "default" .Values.serviceAccount.name }}
    {{- end }}
{{- end }}

{{/* = JWT =================================================================================== */}}

{{/*
Get the jwt secret.
*/}}
{{- define "penpalmap-api-v2.jwt.secretName" -}}
    {{- if .Values.config.jwt.existingSecret -}}
        {{- printf "%s" (tpl .Values.config.jwt.existingSecret $) -}}
    {{- else -}}
        {{- printf "%s-%s" (include "penpalmap-api-v2.fullname" .) "jwt" -}}
    {{- end -}}
{{- end -}}

{{/*
Return true if a secret object should be created
*/}}
{{- define "penpalmap-api-v2.jwt.createSecret" -}}
    {{- if not .Values.config.jwt.existingSecret -}}
        {{- true -}}
    {{- end -}}
{{- end -}}

{{/* = Google ================================================================================ */}}

{{/*
Get the google secret.
*/}}
{{- define "penpalmap-api-v2.google.secretName" -}}
    {{- if .Values.config.google.existingSecret -}}
        {{- printf "%s" (tpl .Values.config.google.existingSecret $) -}}
    {{- else -}}
        {{- printf "%s-%s" (include "penpalmap-api-v2.fullname" .) "google" -}}
    {{- end -}}
{{- end -}}

{{/*
Return true if a secret object should be created
*/}}
{{- define "penpalmap-api-v2.google.createSecret" -}}
    {{- if not .Values.config.google.existingSecret -}}
        {{- true -}}
    {{- end -}}
{{- end -}}

{{/* = Mailjet =============================================================================== */}}

{{/*
Get the mailjet secret.
*/}}
{{- define "penpalmap-api-v2.mailjet.secretName" -}}
    {{- if .Values.config.mailjet.existingSecret -}}
        {{- printf "%s" (tpl .Values.config.mailjet.existingSecret $) -}}
    {{- else -}}
        {{- printf "%s-%s" (include "penpalmap-api-v2.fullname" .) "mailjet" -}}
    {{- end -}}
{{- end -}}

{{/*
Return true if a secret object should be created
*/}}
{{- define "penpalmap-api-v2.mailjet.createSecret" -}}
    {{- if not .Values.config.mailjet.existingSecret -}}
        {{- true -}}
    {{- end -}}
{{- end -}}

{{/* = PostgreSQL ============================================================================ */}}

{{/*
Get the postgresql secret.
*/}}
{{- define "penpalmap-api-v2.postgresql.secretName" -}}
    {{- if .Values.config.postgresql.existingSecret -}}
        {{- printf "%s" (tpl .Values.config.postgresql.existingSecret $) -}}
    {{- else -}}
        {{- printf "%s-%s" (include "penpalmap-api-v2.fullname" .) "postgresql" -}}
    {{- end -}}
{{- end -}}

{{/*
Return true if a secret object should be created
*/}}
{{- define "penpalmap-api-v2.postgresql.createSecret" -}}
    {{- if not .Values.config.postgresql.existingSecret -}}
        {{- true -}}
    {{- end -}}
{{- end -}}

{{/* = Minio ================================================================================= */}}

{{/*
Get the minio secret.
*/}}
{{- define "penpalmap-api-v2.minio.secretName" -}}
    {{- if .Values.config.minio.existingSecret -}}
        {{- printf "%s" (tpl .Values.config.minio.existingSecret $) -}}
    {{- else -}}
        {{- printf "%s-%s" (include "penpalmap-api-v2.fullname" .) "minio" -}}
    {{- end -}}
{{- end -}}

{{/*
Return true if a secret object should be created
*/}}
{{- define "penpalmap-api-v2.minio.createSecret" -}}
    {{- if not .Values.config.minio.existingSecret -}}
        {{- true -}}
    {{- end -}}
{{- end -}}