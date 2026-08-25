/**
 * supabase/migrations/의 스키마와 손으로 맞춘 타입 정의.
 * 실제 Supabase 프로젝트를 연결한 뒤 `supabase gen types typescript`로 생성한 결과로 교체해도 된다.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string
          api_key_encrypted: string | null
          topic: string
          business_info_by_topic: Json
          body_templates: Json
          writing_rules: string
          tone: string
          length: string
          footer_text: string
          bridge_url_template: string
          updated_at: string
        }
        Insert: {
          user_id: string
          api_key_encrypted?: string | null
          topic?: string
          business_info_by_topic?: Json
          body_templates?: Json
          writing_rules?: string
          tone?: string
          length?: string
          footer_text?: string
          bridge_url_template?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          api_key_encrypted?: string | null
          topic?: string
          business_info_by_topic?: Json
          body_templates?: Json
          writing_rules?: string
          tone?: string
          length?: string
          footer_text?: string
          bridge_url_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          user_id: string
          main_keyword: string
          title: string
          body: string
          tags: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          main_keyword: string
          title: string
          body: string
          tags?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          main_keyword?: string
          title?: string
          body?: string
          tags?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      set_encrypted_api_key: {
        Args: { p_api_key: string, p_secret: string }
        Returns: undefined
      }
      get_decrypted_api_key: {
        Args: { p_secret: string }
        Returns: string
      }
      clear_api_key: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
