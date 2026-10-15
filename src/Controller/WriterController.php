<?php

declare(strict_types=1);

namespace App\Controller;

use Proceda\Infrastructure\Serializer\Factory as SerializerFactory;
use Proceda\Intercambio;
use Proceda\Proceda;
use Proceda\Schema\LayoutType;
use Proceda\Schema\LayoutVersion;
use Proceda\Writer\Client;
use Proceda\Writer\Transport\UnixSocketTransport;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Exception\ExceptionInterface;

#[Route('/api/write')]
final class WriterController extends AbstractController
{
	/**
	 * @throws ExceptionInterface
	 */
	#[Route('/{layout}/{version}', methods: ['POST'])]
	public function __invoke(
		Request $request,
		string $layout,
		string $version,
	): JsonResponse {
		$layout = Proceda::create(
			LayoutType::from($layout),
			LayoutVersion::from($version),
		);

		$serializer = SerializerFactory::create(
			$layout->getSchemaManager(),
		);

		$intercambio = $serializer->deserialize(
			$request->getContent(),
			Intercambio::class,
			'json',
		);

		$client = Client::create(
			new UnixSocketTransport(
				getenv('PROCEDA_WRITER_SOCKET')
					?: '/run/proceda/writer.sock',
			),
			$layout->getSchemaManager(),
		);

		$response = $client->write(
			document: $intercambio,
			layout: $layout,
		);

		if (!$response->successful()) {
			throw new \RuntimeException(
				$response->exception ?? 'Writer failed',
			);
		}

        return $this->json([
            'validation' => $serializer->normalize(
                $response->validation,
            ),
            'content' => $response->content !== null
                ? base64_encode($response->content)
                : null,
        ]);
	}
}
