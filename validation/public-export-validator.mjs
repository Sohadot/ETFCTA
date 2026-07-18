const forbidden = [/%TEMP%/i, /(?:^|[^a-z])[a-z]:\\/i, /file:\/\//i, /restricted-local:/i, /localhost/i, /127\.0\.0\.1/i];
export const findPublicExportLeaks = (value, path = '$') => {
  const errors=[];
  if(typeof value === 'string' && forbidden.some((pattern)=>pattern.test(value))) errors.push(`${path}: internal locator leaked`);
  else if(Array.isArray(value)) value.forEach((item,index)=>errors.push(...findPublicExportLeaks(item,`${path}[${index}]`)));
  else if(value && typeof value === 'object') for(const [key,item] of Object.entries(value)) errors.push(...findPublicExportLeaks(item,`${path}.${key}`));
  return errors;
};
export const validatePublicExportShape = (value) => {
  const errors=findPublicExportLeaks(value);
  if(value.projection_schema !== 'ETFCTA-PUBLIC-EXPORT-001-v0.1.0') errors.push('$.projection_schema: invalid');
  for(const [index,source] of (value.sources ?? []).entries()){
    const keys=Object.keys(source.preservation ?? {}).sort();
    const allowed=['access','document_sha256','public_locator','retrievability','status'].sort();
    if(JSON.stringify(keys)!==JSON.stringify(allowed)) errors.push(`$.sources[${index}].preservation: public allowlist violated`);
  }
  return errors;
};
