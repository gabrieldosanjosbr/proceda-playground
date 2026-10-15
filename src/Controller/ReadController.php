<?php

declare(strict_types=1);

namespace App\Controller;

use Proceda\Infrastructure\Serializer\Factory as SerializerFactory;
use Proceda\Proceda;
use Proceda\Schema\LayoutType;
use Proceda\Schema\LayoutVersion;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Exception\ExceptionInterface;

#[Route('/api/read')]
final class ReadController extends AbstractController
{
    /**
     * @throws \ReflectionException
     * @throws ExceptionInterface
     */
    #[Route('/{layout}/{version}', methods: ['POST'])]
    public function __invoke(
        Request $request,
        string $layout,
        string $version
    ): Response {
		$tabReplacementSize = $request->query->getInt(
			'tabReplacementSize',
			1,
		);

		if ($tabReplacementSize < 1 || $tabReplacementSize > 16) {
			throw new BadRequestHttpException(
				'tabReplacementSize must be between 1 and 16.',
			);
		}

        $layout = Proceda::create(
            layoutType: LayoutType::from($layout),
            layoutVersion: LayoutVersion::from($version),
			tabReplacementSize: $tabReplacementSize,
        );

        $content = base64_decode(
            $request->getContent(),
            strict: true,
        );

        if ($content === false) {
            throw new \InvalidArgumentException(
                'Invalid Base64 content.',
            );
        }

        $intercambio = $layout->readFromString($content);

        $serializer = SerializerFactory::create(
            $layout->getSchemaManager(),
        );

        return new Response(
            $serializer->serialize(
                $intercambio,
                'json',
            ),
            headers: [
                'Content-Type' => 'application/json',
            ],
        );
    }
}
