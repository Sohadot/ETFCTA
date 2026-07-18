const typeMatches = (value, type) => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : typeof value === type;
const isDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const isDateTime = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) && !Number.isNaN(Date.parse(value));

export function validateSchema(value, schema, at = '$') {
  const errors = [];
  const fail = (message) => errors.push(`${at}: ${message}`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) { fail(`expected ${types.join('|')}`); return errors; }
  }
  if (Object.hasOwn(schema, 'const') && value !== schema.const) fail(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) fail(`must be one of ${schema.enum.join(', ')}`);
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail(`minimum length is ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) fail(`maximum length is ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(`does not match ${schema.pattern}`);
    if (schema.format === 'date' && !isDate(value)) fail('invalid date');
    if (schema.format === 'date-time' && !isDateTime(value)) fail('invalid date-time');
    if (schema.format === 'uri') { try { new URL(value); } catch { fail('invalid URI'); } }
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) fail(`minimum is ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) fail(`maximum is ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`requires at least ${schema.minItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) fail('items must be unique');
    if (schema.items) value.forEach((item, index) => errors.push(...validateSchema(item, schema.items, `${at}[${index}]`)));
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) fail(`requires at least ${schema.minProperties} properties`);
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) errors.push(`${at}.${key}: required`);
    for (const [key, child] of Object.entries(value)) {
      const childSchema = schema.properties?.[key] ?? (typeof schema.additionalProperties === 'object' ? schema.additionalProperties : null);
      if (childSchema) errors.push(...validateSchema(child, childSchema, `${at}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${at}.${key}: additional property not allowed`);
    }
  }
  if (schema.oneOf && schema.oneOf.filter((candidate) => validateSchema(value, candidate, at).length === 0).length !== 1) fail('must match exactly one oneOf schema');
  if (schema.anyOf && !schema.anyOf.some((candidate) => validateSchema(value, candidate, at).length === 0)) fail('must match at least one anyOf schema');
  return errors;
}
