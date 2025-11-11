import {Template} from '../types';

export const TEMPLATES: Map<string, Template> = new Map([
  ['none', {name: 'No Template', content: ''}],
  ['SOAP',
    {
      name: 'SOAP Template',
      content: `
## Subjective:
- Patient history, owner concerns, symptoms reported

## Objective:
- Physical exam findings, vital signs, observable data

## Assessment:
- Diagnosis or differential diagnoses

## Plan:
- Treatment plan, medications, follow-up instructions
`
    }],
  ['inpatient-assessment',
    {
      name: 'Inpatient Assessment',
      content: `
## CURRENT TREATMENTS:
1. Fluids
2. Nutrition: RER = ____kcal/d, feeding RC GI LF liquid (0.9kcal/mL) or RC Recovery (0.9kcal/mL) or RC renal liquid (1.3 kcal/mL dog, 0.9kcal/mL cat)
   * 1/4 RER = _____kcal/d = _____kcal/feeding q4h via NG
   * Aspirate NG tube prior to feeding, follow feedings with ____ mL H2O via NG
   * Offer bland diet to face prior to tube feeding, skip if eats at least ____ kcal on own
   **DIAGNOSTICS**:
* **Heska CPP:**
* **PCV/TS:**
* **Heska CBC:**
* **Blood smear** (made directly from patient, not LTT):
  * Platelet estimate:
  * 100 WBC cell differential:
  * Other: anisocytosis? polycythemia? intra-/extra-cellular parasites? nRBCs / 100 WBCs?
  * **NOVA:**
* **3v AXR / CXR / WBXR report:**
* **Lactate**:
* **Doppler / Cardell BP** (#__ cuff on ___L unless otherwise specified) :
  *
  * **UA:**
* **FIRSTrack UMIC**:
* **A/T/GFAST:**

## PROBLEM LIST:
1.
**AM ASSESSMENT / OWNER COMMUNICATION:**
**TTO ([ClientFirstName], phone) @ ___ :** ___
`,
    }],
  ['inpatient-plan', {
    name: 'Inpatient Plan',
    content: `
## Monitoring:
- See Instinct monitoring sheet

## AM changes:
- Adjust IVF, pain meds, nutrition, labs?

## PM changes/assessment/update:
- Adjust IVF, pain meds, nutrition, labs?
`,
  }],
  ['canine-wellness', {
    name: 'Canine Wellness Exam',
    content: `
## Client Communication:

Discussed vaccine schedule and vaccine reactions.
Recommended monthly flea/tick/heartworm
Recommend heartworm testing.
Recommend performing dental cleaning in _
Recommend screening labwork.

## Diagnostics:

## In-hospital Treatments:

## Vaccines:

Rabies vaccine - administered subcutaneously (right shoulder)
DA2PP vaccine - administered subcutaneously (left shoulder)
DA2LPP vaccine - administered subcutaneously (left shoulder)
Leptospirosis vaccine - administered subcutaneously (left shoulder)
Canine influenza (H3N2/H3N8) - administered subcutaneously (interscapular region)
Bordetella/CPIV/CAV-2 - administered intranasally.
Medications:
OK to refill preventative products with annual exam.
    `
  }],
  ['feline-wellness', {
    name: 'Feline Wellness Exam',
    content: `
## Client Communication:

- Discussed vaccine schedule and vaccine reactions.
- Recommended monthly flea/tick/heartworm
- Recommend performing dental cleaning in _
- Recommend screening labwork.

## Diagnostics:

## In-hospital Treatments:

## Vaccines:

- Rabies vaccine (Purevax) - administered subcutaneously (distal right pelvic limb)
- FRCP vaccine - administered subcutaneously (distal right thoracic limb)
- FeLV vaccine - administered subcutaneously (distal left pelvic limb)

## Medications:

OK to refill preventative products with annual exam.
`,
  }],
  ['kitten-plan', {
    name: "Kitten Plan",
    content: `
## Discussed kitten care with O:
- Vaccine schedule - Core (FVRCP, Rabies) vs. non-core (FeLV in cats >1 yr)
- Vaccine reactions - Normal (e.g. mild lethargy, injection site inflammation) vs. emergency (e.g. vomiting, diarrhea, facial/generalized pruritus, increased respiratory rate/effort, collapse)
- Discussed injection site sarcoma - “1-2-3 rule” (Increasing in site >1 month after vaccination, >2cm in diameter, remains present > 3 months after vaccination); Occur at a rate of about 1 per 10,000 - 30,000 vaccinations
- Patient not protected from infectious disease - Recommended avoiding other kittens or high risk areas until 1-2 weeks after last vaccination
- Retroviral testing - Recommended testing prior to FeLV vaccination
- Intestinal parasites - Recommended Fecal OP+G and deworming (4 total; 2 weeks apart)
- External parasites and heartworm disease - Discussed preventative options
- OVH/Castration with microchip - 4-6 months of age before 1st heat
- Dental care - Brushing, VOHC products, eventual COHAT even with great oral care
- Nutrition - Feed kitten food until 1 year of age, avoid grain free, vegan, or raw diets
- Socialization - Socialization period closes at 7-8 weeks; desensitization from head to toe; exposing to people, car, vacuum, etc.
- Environment - Recommended indoor only, away from open windows, etc.
- Insurance - Pawlicy advisor to compare insurance plans
- Care Club Wellness Plan

## Diagnostics:

## In-hospital Treatments:

## Vaccines:
- Rabies vaccine (Purevax) - administered subcutaneously (distal right pelvic limb)
- FRCP vaccine - administered subcutaneously (distal right thoracic limb)
- FeLV vaccine - administered subcutaneously (distal left pelvic limb)

## Medications:

OK to refill preventative products with annual exam.
`,
  }]
]);

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.get(id);
}
