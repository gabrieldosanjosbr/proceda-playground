<?php

declare(strict_types=1);

namespace App\Controller;

use Proceda\Proceda;
use Proceda\Schema\LayoutType;
use Proceda\Schema\LayoutVersion;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/layouts')]
final class LayoutController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            'layouts' => [
                [
                    'value' => LayoutType::NOTFIS->value,
                    'label' => 'NOTFIS',
                    'versions' => [
                        [
                            'value' => LayoutVersion::V31->value,
                            'label' => '3.1',
                        ],
                        [
                            'value' => LayoutVersion::V50->value,
                            'label' => '5.0',
                        ],
                    ],
                ],
                [
                    'value' => LayoutType::OCOREN->value,
                    'label' => 'OCOREN',
                    'versions' => [
                        [
                            'value' => LayoutVersion::V31->value,
                            'label' => '3.1',
                        ],
                        [
                            'value' => LayoutVersion::V50->value,
                            'label' => '5.0',
                        ],
                    ],
                ],
                [
                    'value' => LayoutType::DOCCOB->value,
                    'label' => 'DOCCOB',
                    'versions' => [
                        [
                            'value' => LayoutVersion::V30->value,
                            'label' => '3.0',
                        ],
                        [
                            'value' => LayoutVersion::V50->value,
                            'label' => '5.0',
                        ],
                    ],
                ],
                [
                    'value' => LayoutType::CONEMB->value,
                    'label' => 'CONEMB',
                    'versions' => [
                        [
                            'value' => LayoutVersion::V31->value,
                            'label' => '3.1',
                        ],
                    ],
                ],
            ],
        ]);
    }

    #[Route('/{type}/{version}', methods: ['GET'])]
    public function tree(
        string $type,
        string $version,
    ): JsonResponse {
        $type = LayoutType::from($type);

        $version = LayoutVersion::from($version);

        $layout = match ($type) {
            LayoutType::NOTFIS => Proceda::notfis($version),
            LayoutType::OCOREN => Proceda::ocoren($version),
            LayoutType::DOCCOB => Proceda::doccob($version),
            LayoutType::CONEMB => Proceda::conemb($version),
        };

        $manager = $layout->getSchemaManager();

        $response = $this->json([
            'type' => $type,
            'version' => $version,
            'schema' => $manager->getRootSchema(),
            'graph' => $manager->getGraph(),
        ]);

        $response->setPublic();
        $response->setMaxAge(3600);
        $response->setSharedMaxAge(3600);

        return $response;
    }
}
