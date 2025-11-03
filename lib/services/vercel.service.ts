/**
 * Service d'intégration Vercel
 * Gère le déploiement et la configuration des instances sur Vercel
 */

import { VercelEnvironmentVariable, VERCEL_CONFIG } from '@/types/multi-tenant';

export interface VercelDeploymentConfig {
  name: string;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  apiKey: string;
}

export interface VercelDeploymentResult {
  projectId: string;
  projectName: string;
  environmentId: string;
  deploymentUrl: string;
  variables: Record<string, string>;
}

export class VercelService {
  private apiToken: string;
  private apiUrl: string = 'https://api.vercel.com';
  private teamId: string;

  constructor() {
    this.apiToken = process.env.VERCEL_API_TOKEN || '';
    this.teamId = process.env.VERCEL_TEAM_ID || '';

    if (!this.apiToken) {
      console.warn('VERCEL_API_TOKEN not set');
    }
  }

  /**
   * Déploie une nouvelle instance sur Vercel
   */
  async deployInstance(config: VercelDeploymentConfig): Promise<VercelDeploymentResult> {
    const projectName = `${VERCEL_CONFIG.PROJECT_PREFIX}${config.subdomain}`;

    // 1. Créer ou obtenir le projet Vercel
    const project = await this.createOrGetProject(projectName);

    // 2. Créer un environnement de déploiement
    const environment = await this.createEnvironment(project.id);

    // 3. Configurer les variables d'environnement
    const variables = await this.configureEnvironmentVariables(
      project.id,
      environment.id,
      config
    );

    // 4. Déclencher un déploiement
    const deployment = await this.triggerDeployment(
      project.id,
      config.subdomain,
      variables
    );

    return {
      projectId: project.id,
      projectName: project.name,
      environmentId: environment.id,
      deploymentUrl: deployment.url,
      variables,
    };
  }

  /**
   * Crée ou obtient un projet Vercel
   */
  private async createOrGetProject(projectName: string): Promise<any> {
    try {
      // Essayer de récupérer le projet existant
      const response = await fetch(
        `${this.apiUrl}/v9/projects/${projectName}?teamId=${this.teamId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (response.ok) {
        return response.json();
      }

      // Si le projet n'existe pas, le créer
      if (response.status === 404) {
        const createResponse = await fetch(`${this.apiUrl}/v10/projects`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: projectName,
            teamId: this.teamId,
            framework: 'nextjs',
            buildCommand: 'npm run build',
            installCommand: 'npm install',
            outputDirectory: '.next',
          }),
        });

        if (!createResponse.ok) {
          throw new Error(`Failed to create project: ${createResponse.statusText}`);
        }

        return createResponse.json();
      }

      throw new Error(`Failed to get project: ${response.statusText}`);
    } catch (error) {
      console.error('Error in createOrGetProject:', error);
      throw error;
    }
  }

  /**
   * Crée un environnement de déploiement
   */
  private async createEnvironment(projectId: string): Promise<any> {
    // Dans Vercel, les environnements sont généralement managés par défaut
    // Pour cet exemple, nous retournons un environnement par défaut
    return {
      id: 'default',
      name: 'Production',
    };
  }

  /**
   * Configure les variables d'environnement
   */
  private async configureEnvironmentVariables(
    projectId: string,
    environmentId: string,
    config: VercelDeploymentConfig
  ): Promise<Record<string, string>> {
    const variables: VercelEnvironmentVariable[] = [
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.APP_NAME,
        value: config.name,
        type: 'plain',
      },
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.APP_COLOR_PRIMARY,
        value: config.primaryColor,
        type: 'plain',
      },
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.APP_COLOR_SECONDARY,
        value: config.secondaryColor,
        type: 'plain',
      },
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.APP_LOGO_URL,
        value: config.logo || '',
        type: 'plain',
      },
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.API_KEY,
        value: config.apiKey,
        type: 'secret',
      },
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.PLAN_TYPE,
        value: 'trial',
        type: 'plain',
      },
      {
        key: VERCEL_CONFIG.ENVIRONMENT_VARIABLES.SUBSCRIPTION_STATUS,
        value: 'active',
        type: 'plain',
      },
    ];

    const varMap: Record<string, string> = {};

    for (const variable of variables) {
      try {
        await fetch(
          `${this.apiUrl}/v10/projects/${projectId}/env?teamId=${this.teamId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key: variable.key,
              value: variable.value,
              type: variable.type,
              target: ['production', 'preview', 'development'],
            }),
          }
        );

        varMap[variable.key] = variable.value;
      } catch (error) {
        console.error(`Failed to set environment variable ${variable.key}:`, error);
      }
    }

    return varMap;
  }

  /**
   * Met à jour les variables d'environnement
   */
  async updateEnvironmentVariables(
    projectId: string,
    environmentId: string,
    updates: Record<string, string>
  ): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      try {
        // Récupérer la variable existante
        const getResponse = await fetch(
          `${this.apiUrl}/v9/projects/${projectId}/env?key=${key}&teamId=${this.teamId}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          }
        );

        if (getResponse.ok) {
          // Mettre à jour la variable existante
          const envVar = await getResponse.json();
          await fetch(
            `${this.apiUrl}/v9/projects/${projectId}/env/${envVar.id}?teamId=${this.teamId}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                value,
              }),
            }
          );
        } else {
          // Créer la nouvelle variable
          await fetch(
            `${this.apiUrl}/v10/projects/${projectId}/env?teamId=${this.teamId}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                key,
                value,
                type: 'plain',
                target: ['production', 'preview', 'development'],
              }),
            }
          );
        }
      } catch (error) {
        console.error(`Failed to update environment variable ${key}:`, error);
      }
    }
  }

  /**
   * Déclenche un déploiement
   */
  private async triggerDeployment(
    projectId: string,
    subdomain: string,
    variables: Record<string, string>
  ): Promise<any> {
    // Créer un déploiement Vercel
    const response = await fetch(
      `${this.apiUrl}/v13/deployments?teamId=${this.teamId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: subdomain,
          project: projectId,
          gitSource: {
            type: 'github',
            repo: process.env.GITHUB_REPO || 'simon571/AfrikacashPharma',
            ref: 'main',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to trigger deployment: ${response.statusText}`);
    }

    const deployment = await response.json();

    return {
      id: deployment.id,
      url: deployment.url,
      status: deployment.status,
    };
  }

  /**
   * Supprime un projet Vercel
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v9/projects/${projectId}?teamId=${this.teamId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un déploiement
   */
  async getDeploymentStatus(projectId: string, deploymentId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v11/deployments/${deploymentId}?teamId=${this.teamId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get deployment status: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting deployment status:', error);
      throw error;
    }
  }

  /**
   * Configure un domaine personnalisé
   */
  async configureDomain(projectId: string, domain: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v10/projects/${projectId}/domains?teamId=${this.teamId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            domain,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to configure domain: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error configuring domain:', error);
      throw error;
    }
  }
}

export const vercelService = new VercelService();
