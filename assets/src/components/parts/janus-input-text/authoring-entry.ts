/* eslint-disable @typescript-eslint/no-var-requires */
const manifest = require('./manifest.json');
import register from '../customElementWrapper';
import {
  customEvents as apiCustomEvents,
  observedAttributes as apiObservedAttributes,
} from '../partsApi';
import InputText from './InputText';
import { schema, uiSchema } from './schema';

const observedAttributes: string[] = [...apiObservedAttributes];
const customEvents: any = { ...apiCustomEvents };

register(InputText, manifest.authoring.element, observedAttributes, {
  customEvents,
  shadow: false,
  customApi: {
    getSchema: () => schema,
    getUiSchema: () => uiSchema,
  },
});