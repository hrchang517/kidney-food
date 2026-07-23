export type ConditionKey = 'kidney' | 'diabetes' | 'hypertension' | 'liver' | 'diet';

export interface ConditionConfig {
  key: ConditionKey;
  label: string;
  description: string;
  nutrientFocus: string;
  stages: string[];
}

export const CONDITIONS: ConditionConfig[] = [
  {
    key: 'kidney',
    label: '신장',
    description: '신장 질환 환자',
    nutrientFocus: '나트륨, 칼륨, 인 함량',
    stages: [
      '일반적인 신장 건강 관리',
      '만성 신부전 초기 (1-2단계)',
      '만성 신부전 중기 (3단계)',
      '만성 신부전 후기 (4-5단계, 투석 전)',
      '혈액 투석 중',
      '복막 투석 중',
    ],
  },
  {
    key: 'diabetes',
    label: '당뇨',
    description: '당뇨병 환자',
    nutrientFocus: '혈당지수(GI), 탄수화물, 당류 함량',
    stages: [
      '당뇨 전단계 (공복혈당장애)',
      '제2형 당뇨 초기',
      '경구약 복용 중',
      '인슐린 치료 중',
      '임신성 당뇨',
    ],
  },
  {
    key: 'hypertension',
    label: '고혈압',
    description: '고혈압 환자',
    nutrientFocus: '나트륨(염분), 칼륨, 포화지방 함량',
    stages: [
      '경계성 고혈압',
      '1기 고혈압',
      '2기 고혈압',
      '약물 치료 중',
      '저염식 실천 중',
    ],
  },
  {
    key: 'liver',
    label: '간기능',
    description: '간 기능이 저하된 환자',
    nutrientFocus: '알코올, 지방, 단백질 함량',
    stages: [
      '단순 지방간',
      '만성 간염',
      '간경변 초기',
      '간 기능 수치 상승',
      '금주 및 회복 중',
    ],
  },
  {
    key: 'diet',
    label: '다이어트',
    description: '체중 감량 중인 사람',
    nutrientFocus: '칼로리, 탄수화물, 지방 함량',
    stages: [
      '체중 감량 초기',
      '정체기 극복 중',
      '근육량 유지 병행',
      '유지어트 (감량 후 유지)',
      '저탄수화물 식단 중',
    ],
  },
];

export function getCondition(key: ConditionKey): ConditionConfig {
  return CONDITIONS.find((c) => c.key === key) ?? CONDITIONS[0];
}
